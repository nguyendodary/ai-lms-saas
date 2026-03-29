import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { Link } from "react-router-dom";
import { User as UserIcon, CreditCard, Calendar, Mail } from "lucide-react";

export default function ProfilePage() {
  const { appUser, loading } = useAuth();

  if (loading) {
    return <DashboardLayout><Skeleton className="h-8 w-32" /><Skeleton className="h-48 mt-6" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Profile</h1><p className="text-muted-foreground">Manage your account and subscription.</p></div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" />Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                {appUser?.first_name?.[0] || appUser?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{appUser?.first_name} {appUser?.last_name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-3 w-3" />{appUser?.email}</div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm font-medium">Member Since</p><p className="text-sm text-muted-foreground">{appUser?.created_at ? new Date(appUser.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm font-medium">Plan</p><Badge variant={appUser?.plan === "pro" ? "default" : "secondary"}>{appUser?.plan?.toUpperCase() || "FREE"}</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Usage</CardTitle><CardDescription>Your session usage this month.</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sessions Used</span>
              <span className="text-sm text-muted-foreground">{appUser?.sessions_this_month || 0} / {appUser?.plan === "pro" ? "Unlimited" : appUser?.session_limit || 10}</span>
            </div>
            {appUser?.plan !== "pro" && <Progress value={((appUser?.sessions_this_month || 0) / (appUser?.session_limit || 10)) * 100} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
          <CardContent>
            {appUser?.plan === "pro" ? (
              <div className="flex items-center justify-between"><div><p className="font-medium">Pro Plan</p><p className="text-sm text-muted-foreground">Unlimited sessions</p></div><Badge>Active</Badge></div>
            ) : (
              <div className="flex items-center justify-between"><div><p className="font-medium">Free Plan</p><p className="text-sm text-muted-foreground">{appUser?.session_limit || 10} sessions/month</p></div><Link to="/pricing"><Button>Upgrade</Button></Link></div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
