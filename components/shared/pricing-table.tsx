import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  {
    name: "Free",
    description: "For small teams getting started",
    price: "Free",
    features: [
      "Up to 3 job listings",
      "Basic job board visibility",
      "Email support",
      "Basic analytics",
    ],
    buttonText: "Current Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing companies",
    price: "$29/mo",
    features: [
      "Up to 50 job listings",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    buttonText: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Custom",
    features: [
      "Unlimited job listings",
      "Dedicated support",
      "API access",
      "Custom integrations",
      "SLA guarantee",
    ],
    buttonText: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingTable() {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Pricing Plans</h2>
      <p className="text-muted-foreground">
        Custom pricing implementation coming soon.
      </p>
    </div>
    // <div className="space-y-8">
    //   <div className="text-center">
    //     <h2 className="text-2xl font-bold tracking-tight">Choose Your Plan</h2>
    //     <p className="text-muted-foreground mt-2">
    //       Select the plan that works best for your hiring needs
    //     </p>
    //   </div>

    //   <div className="grid gap-6 md:grid-cols-3">
    //     {PLANS.map((plan) => (
    //       <Card
    //         key={plan.name}
    //         className={`relative ${plan.highlighted ? "border-primary shadow-lg" : ""}`}
    //       >
    //         {plan.highlighted && (
    //           <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
    //             Most Popular
    //           </Badge>
    //         )}
    //         <CardHeader>
    //           <CardTitle className="text-xl">{plan.name}</CardTitle>
    //           <CardDescription>{plan.description}</CardDescription>
    //           <p className="text-3xl font-bold mt-2">{plan.price}</p>
    //         </CardHeader>
    //         <CardContent className="space-y-4">
    //           <ul className="space-y-2">
    //             {plan.features.map((feature) => (
    //               <li key={feature} className="flex items-center gap-2 text-sm">
    //                 <Check className="h-4 w-4 text-primary" />
    //                 {feature}
    //               </li>
    //             ))}
    //           </ul>
    //           <Button
    //             className="w-full"
    //             variant={plan.highlighted ? "default" : "outline"}
    //             disabled={plan.name === "Free"}
    //           >
    //             {plan.buttonText}
    //           </Button>
    //         </CardContent>
    //       </Card>
    //     ))}
    //   </div>
    // </div>
  );
}
