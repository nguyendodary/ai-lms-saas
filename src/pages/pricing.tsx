import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const plans = [
  {
    key: "free", name: "Free", description: "Get started with AI learning", price: 0,
    features: ["10 AI sessions per month", "Basic voice companions", "Session history", "Email support"],
  },
  {
    key: "pro", name: "Pro", description: "Unlimited AI-powered learning", price: 19.99,
    features: ["Unlimited AI sessions", "All voice companions", "Advanced analytics", "Priority support", "Custom styles"],
  },
];

export default function PricingPage() {
  const { appUser } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">A</div>
            <span className="text-lg font-semibold">AI LMS</span>
          </div>
        </div>
      </header>
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Start free and upgrade when ready.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.key} className={plan.key === "pro" ? "border-primary shadow-lg relative" : "relative"}>
              {plan.key === "pro" && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4"><span className="text-4xl font-bold">${plan.price}</span>{plan.price > 0 && <span className="text-muted-foreground">/mo</span>}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">{plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{f}</li>)}</ul>
                {appUser?.plan === plan.key ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : plan.key === "free" ? (
                  <Button variant="outline" className="w-full" disabled>Free</Button>
                ) : (
                  <Button className="w-full" onClick={() => toast.info("Configure Stripe to enable payments")}>Upgrade to Pro</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
