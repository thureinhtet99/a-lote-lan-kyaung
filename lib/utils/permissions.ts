"use server";

import { headers } from "next/headers";
import { auth } from "../auth/auth";
import type { StatementType, PermissionAction } from "./access-control";

export async function hasOrgUserPermission<T extends StatementType>(
  resource: T,
  actions: PermissionAction<T>[],
): Promise<boolean> {
  try {
    const result = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          [resource]: actions,
        },
      },
    });

    return result.success;
  } catch {
    return false;
  }
}

export async function hasOrgUserPermissionLegacy(
  permission: string,
): Promise<boolean> {
  // Parse old permission format "resource.action"
  const [resource, action] = permission.split(".") as [StatementType, string];

  if (!resource || !action) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return hasOrgUserPermission(resource, [action as any]);
}

/**
 * Check if user is owner of the active organization
 */
export async function isOrgOwner(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return false;
    }

    const member = await auth.api.getActiveMember({
      headers: await headers(),
    });

    return member?.role === "owner";
  } catch {
    return false;
  }
}

/**
 * Check if user is admin or owner of the active organization
 */
export async function isOrgAdminOrOwner(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return false;
    }

    const member = await auth.api.getActiveMember({
      headers: await headers(),
    });

    return member?.role === "owner" || member?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Get current user's role in active organization
 */
export async function getCurrentOrgRole(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return null;
    }

    const member = await auth.api.getActiveMember({
      headers: await headers(),
    });

    return member?.role ?? null;
  } catch {
    return null;
  }
}
