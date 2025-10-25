import { CheckConditionType } from "@/types/check-condition.type";
import { Suspense } from "react";

export default function CheckCondition({
  condition,
  children,
  loadingFallback,
  otherwise,
}: CheckConditionType) {
  return (
    <Suspense fallback={loadingFallback}>
      <SuspendedComponent condition={condition} otherwise={otherwise}>
        {children}
      </SuspendedComponent>
    </Suspense>
  );
}

const SuspendedComponent = async ({
  condition,
  children,
  otherwise,
}: Omit<CheckConditionType, "loadingFallback">) => {
  return (await condition()) ? children : otherwise;
};
