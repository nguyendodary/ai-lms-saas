import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Link } from "react-router-dom";
import { Bot, Clock, TrendingUp, Plus, Zap } from "lucide-react";
import type { User, Companion, AnalyticsData } from "@/types";

export default function DashboardPage() {
  const { appUser } = useAuth();
  const [data, setData] = useState<{ user: User | null; companions: Companion[]; analytics: AnalyticsData } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!appUser) return;
      const supabase = getSupabase();

      const { data: companions } = await supabase.from("companions").select("*").eq("user_id", appUser.id).order("created_at", { ascending: false });
      const { data: sessions } = await supabase.from("sessions").select("id, duration, started_at").eq("user_id", appUser.id);

      const sessionList = sessions || [];
      const totalMinutes = sessionList.reduce((s: number, x: { duration: number }) => s + (x.duration || 0), 0);

      const days: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        days.push({ date: ds, count: sessionList.filter((s: { started_at: string }) => s.started_at.split("T")[0] === ds).length });
      }

      setData({
        user: appUser,
        companions: (companions || []) as Companion[],
        analytics: {
          totalSessions: sessionList.length,
          totalMinutes,
          averageDuration: sessionList.length > 0 ? Math.round(totalMinutes / sessionList.length) : 0,
          sessionsThisMonth: appUser.sessions_this_month,
          sessionLimit: appUser.session_limit,
          plan: appUser.plan,
          sessionsByDay: days,
          sessionsBySubject: [],
        },
      });
      setIsLoading(false);
    }
    load();
  }, [appUser]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div>
        </div>
      </DashboardLayout>
    );
  }

  const a = data?.analytics;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-muted-foreground">Welcome back!</p></div>
          <Link to="/dashboard/companions"><Button className="gap-2"><Plus className="h-4 w-4" />New Companion</Button></Link>
        </div>

        {a?.plan === "free" && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">{a.sessionsThisMonth} / {a.sessionLimit} sessions used</p>
                  <Progress value={(a.sessionsThisMonth / a.sessionLimit) * 100} className="mt-1 h-2 w-48" />
                </div>
              </div>
              <Link to="/pricing"><Button variant="outline" size="sm">Upgrade to Pro</Button></Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Total Sessions <Bot className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{a?.totalSessions || 0}</div><p className="text-xs text-muted-foreground">{a?.sessionsThisMonth || 0} this month</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Total Minutes <Clock className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{a?.totalMinutes || 0}</div><p className="text-xs text-muted-foreground">~{a?.averageDuration || 0} min avg</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Companions <TrendingUp className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.companions.length || 0}</div><p className="text-xs text-muted-foreground">AI tutors</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Plan <Zap className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold capitalize">{a?.plan || "Free"}</div><p className="text-xs text-muted-foreground">{a?.plan === "pro" ? "Unlimited" : `${a?.sessionLimit || 10}/month`}</p></CardContent></Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Companions</h2>
          {data?.companions.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12"><Bot className="mb-4 h-12 w-12 text-muted-foreground" /><h3 className="mb-2 text-lg font-semibold">No companions yet</h3><p className="mb-4 text-sm text-muted-foreground">Create your first AI companion to start learning.</p><Link to="/dashboard/companions"><Button>Create Companion</Button></Link></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data?.companions.slice(0, 3).map((c) => (
                <Card key={c.id}><CardHeader><CardTitle className="text-base">{c.name}</CardTitle><p className="text-sm text-muted-foreground">{c.subject} - {c.topic}</p></CardHeader><CardContent><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{c.duration} min</span><Link to={`/dashboard/companions/${c.id}`}><Button size="sm">Start</Button></Link></div></CardContent></Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
