import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { BarChart3, Clock, TrendingUp, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const { appUser } = useAuth();
  const [data, setData] = useState<{
    totalSessions: number; totalMinutes: number; averageDuration: number;
    sessionsThisMonth: number; sessionLimit: number; plan: string;
    sessionsByDay: { date: string; count: number }[];
    sessionsBySubject: { subject: string; count: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!appUser) return;
      const supabase = getSupabase();

      const { data: sessions } = await supabase.from("sessions").select("id, duration, started_at, companion_id, companions(subject)").eq("user_id", appUser.id);
      const list = sessions || [];
      const totalMinutes = list.reduce((s: number, x: { duration: number }) => s + (x.duration || 0), 0);

      const days: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        days.push({ date: ds, count: list.filter((s: { started_at: string }) => s.started_at.split("T")[0] === ds).length });
      }

      const subjMap: Record<string, number> = {};
      list.forEach((s: { companions?: { subject: string } | null }) => {
        const subj = s.companions?.subject || "Unknown";
        subjMap[subj] = (subjMap[subj] || 0) + 1;
      });

      setData({
        totalSessions: list.length, totalMinutes,
        averageDuration: list.length > 0 ? Math.round(totalMinutes / list.length) : 0,
        sessionsThisMonth: appUser.sessions_this_month, sessionLimit: appUser.session_limit,
        plan: appUser.plan, sessionsByDay: days,
        sessionsBySubject: Object.entries(subjMap).map(([subject, count]) => ({ subject, count })),
      });
      setIsLoading(false);
    }
    load();
  }, [appUser]);

  if (isLoading) {
    return <DashboardLayout><div className="space-y-6"><Skeleton className="h-8 w-32" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div></div></DashboardLayout>;
  }

  const maxDay = Math.max(...(data?.sessionsByDay.map(d => d.count) || [1]), 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Analytics</h1><p className="text-muted-foreground">Track your learning progress.</p></div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex justify-between">Total Sessions <BarChart3 className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.totalSessions || 0}</div><p className="text-xs text-muted-foreground">All time</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex justify-between">Total Minutes <Clock className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.totalMinutes || 0}</div><p className="text-xs text-muted-foreground">Time learning</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex justify-between">Avg Duration <TrendingUp className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.averageDuration || 0} min</div><p className="text-xs text-muted-foreground">Per session</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex justify-between">Monthly <Zap className="h-4 w-4 text-muted-foreground" /></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.sessionsThisMonth || 0}<span className="text-sm font-normal text-muted-foreground"> / {data?.plan === "pro" ? "∞" : data?.sessionLimit || 10}</span></div><p className="text-xs text-muted-foreground">This month</p></CardContent></Card>
        </div>

        {data?.plan !== "pro" && (
          <Card><CardHeader><CardTitle>Monthly Usage</CardTitle><CardDescription>{data?.sessionsThisMonth || 0} of {data?.sessionLimit || 10} used</CardDescription></CardHeader><CardContent><Progress value={((data?.sessionsThisMonth || 0) / (data?.sessionLimit || 10)) * 100} className="h-3" /></CardContent></Card>
        )}

        <Card>
          <CardHeader><CardTitle>Activity (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {data?.sessionsByDay.map((day, idx) => (
                <div key={idx} className="flex-1 min-w-[4px] relative group" style={{ height: `${Math.max((day.count / maxDay) * 100, 4)}%` }}>
                  <div className="bg-primary h-full rounded-t-sm hover:bg-primary/80 transition-colors" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border z-10">{day.count} on {day.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {data?.sessionsBySubject && data.sessionsBySubject.length > 0 && (
          <Card>
            <CardHeader><CardTitle>By Subject</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.sessionsBySubject.map((item) => {
                  const max = Math.max(...data.sessionsBySubject.map(s => s.count));
                  return (
                    <div key={item.subject}>
                      <div className="flex justify-between mb-1"><span className="text-sm font-medium">{item.subject}</span><span className="text-sm text-muted-foreground">{item.count}</span></div>
                      <div className="h-2 w-full rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
