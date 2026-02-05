"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";

/**
 * Color Palette Showcase Component
 * Use this page to view all brand colors and their usage
 * Access at: /design-system (add route if needed)
 */
export function ColorShowcase() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">JobMyanmar Design System</h1>
        <p className="text-muted-foreground">
          Color palette and component examples for Myanmar Job Portal
        </p>
      </div>

      {/* Primary Colors */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Primary - Deep Blue
        </h2>
        <p className="text-muted-foreground mb-4">
          Professional, trustworthy. Used for main actions and branding.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(COLORS.primary).map(([shade, color]) => (
            <Card key={shade}>
              <CardContent className="p-4">
                <div
                  className="w-full h-20 rounded-md mb-2 border"
                  style={{ backgroundColor: color }}
                />
                <p className="text-sm font-mono">{shade}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {color}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>Primary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Badge className="bg-primary">Primary Badge</Badge>
        </div>
      </section>

      {/* Secondary Colors */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-secondary">
          Secondary - Golden Yellow
        </h2>
        <p className="text-muted-foreground mb-4">
          Myanmar&apos;s golden pagodas, prosperity. Used for featured content.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(COLORS.secondary).map(([shade, color]) => (
            <Card key={shade}>
              <CardContent className="p-4">
                <div
                  className="w-full h-20 rounded-md mb-2 border"
                  style={{ backgroundColor: color }}
                />
                <p className="text-sm font-mono">{shade}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {color}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="bg-secondary text-secondary-foreground">
            Featured
          </Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <div className="px-4 py-2 bg-secondary/10 text-secondary-foreground rounded-md font-semibold">
            Highlighted Text
          </div>
        </div>
      </section>

      {/* Tertiary Colors */}
      <section>
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: COLORS.tertiary[500] }}
        >
          Tertiary - Warm Orange
        </h2>
        <p className="text-muted-foreground mb-4">
          Energy, opportunity. Used for highlights and statistics.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(COLORS.tertiary).map(([shade, color]) => (
            <Card key={shade}>
              <CardContent className="p-4">
                <div
                  className="w-full h-20 rounded-md mb-2 border"
                  style={{ backgroundColor: color }}
                />
                <p className="text-sm font-mono">{shade}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {color}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="bg-tertiary text-white">Tertiary Badge</Badge>
          <div
            className="px-4 py-2 bg-tertiary/10 rounded-md font-semibold"
            style={{ color: COLORS.tertiary[500] }}
          >
            Accent Text
          </div>
        </div>
      </section>

      {/* Component Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Component Examples</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Card */}
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardTitle className="text-primary">Primary Card</CardTitle>
              <CardDescription>Professional and trustworthy</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button className="w-full">Take Action</Button>
            </CardContent>
          </Card>

          {/* Secondary Card */}
          <Card className="border-secondary/20">
            <CardHeader className="bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardTitle className="text-secondary">Featured Card</CardTitle>
              <CardDescription>Golden opportunity</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Badge className="bg-secondary text-secondary-foreground w-full justify-center py-2">
                ⭐ Featured
              </Badge>
            </CardContent>
          </Card>

          {/* Tertiary Card */}
          <Card className="border-tertiary/20">
            <CardHeader className="bg-gradient-to-br from-tertiary/10 to-tertiary/5">
              <CardTitle style={{ color: COLORS.tertiary[500] }}>
                Highlight Card
              </CardTitle>
              <CardDescription>Energy and growth</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center">
                <p
                  className="text-3xl font-bold"
                  style={{ color: COLORS.tertiary[500] }}
                >
                  1000+
                </p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gradient Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Gradient Backgrounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="h-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-t-lg" />
            <CardHeader>
              <CardTitle className="text-sm">Primary to Secondary</CardTitle>
              <code className="text-xs">
                from-primary/10 via-background to-secondary/10
              </code>
            </CardHeader>
          </Card>

          <Card>
            <div className="h-32 bg-gradient-to-r from-secondary/10 to-tertiary/5 rounded-t-lg" />
            <CardHeader>
              <CardTitle className="text-sm">Secondary to Tertiary</CardTitle>
              <code className="text-xs">from-secondary/10 to-tertiary/5</code>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Usage Guidelines</h2>
        <Card>
          <CardHeader>
            <CardTitle>When to use each color</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-primary mb-2">Primary Blue</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Main call-to-action buttons</li>
                <li>Navigation active states</li>
                <li>Important headings and links</li>
                <li>Brand elements and logo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                Secondary Gold
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Featured job listings</li>
                <li>Premium badges and highlights</li>
                <li>Success states and achievements</li>
                <li>Special offers and promotions</li>
              </ul>
            </div>
            <div>
              <h3
                className="font-semibold mb-2"
                style={{ color: COLORS.tertiary[500] }}
              >
                Tertiary Orange
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Statistics and metrics</li>
                <li>Growth indicators</li>
                <li>Accent elements</li>
                <li>Secondary highlights</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
