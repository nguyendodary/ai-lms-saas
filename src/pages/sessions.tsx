import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Link } from "react-router-dom";
import { History, Clock, Bot } from "lucide-react";

interface SessionRow { id: string; duration: number; started_at: string; ended_at: string | null; companion_id: string; companions?: { name: string; subject: string; topic: string } }

export default function SessionsPage() {
  const { appUser } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!appUser) return;
      const supabase = getSupabase();
      const { data } = await supabase.from("sessions").select("*, companions(name, subject, topic)").eq("user_id", appUser.id).order("started_at", { ascending: false });
      setSessions((data || []) as SessionRow[]);
      setIsLoading(false);
    }
    load();
  }, [appUser]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Session History</h1><p className="text-muted-foreground">Review your past learning sessions.</p></div>
        {isLoading ? (
          <Card><CardContent className="p-0">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 mx-6 my-2" />)}</CardContent></Card>
        ) : sessions.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16"><History className="mb-4 h-16 w-16 text-muted-foreground" /><h3 className="mb-2 text-xl font-semibold">No sessions yet</h3><p className="text-center text-muted-foreground">Start a session with a companion.</p><Link to="/dashboard/companions" className="mt-4"><button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">Start a Session</button></Link></CardContent></Card>
        ) : (
          <Card><CardContent className="divide-y p-0">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Bot className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-medium">{s.companions?.name || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground">{s.companions?.subject || "Unknown"} - {s.companions?.topic || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3 w-3" />{s.duration || 0} min</div>
                    <p className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <Badge variant={s.ended_at ? "secondary" : "outline"}>{s.ended_at ? "Completed" : "In Progress"}</Badge>
                </div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
