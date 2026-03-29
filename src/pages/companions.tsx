import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Plus, X, Bot, Mic } from "lucide-react";
import { toast } from "sonner";
import type { Companion, CompanionFormData } from "@/types";

const subjects = ["Mathematics","Science","History","English","Computer Science","Physics","Chemistry","Biology","Geography","Art","Music","Foreign Language","Economics"];

export default function CompanionsPage() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CompanionFormData>({ name: "", subject: "", topic: "", voice: "alloy", style: "professional", duration: 15 });
  const [creating, setCreating] = useState(false);

  const loadCompanions = useCallback(async () => {
    if (!appUser) return;
    const supabase = getSupabase();
    const { data } = await supabase.from("companions").select("*").eq("user_id", appUser.id).order("created_at", { ascending: false });
    setCompanions((data || []) as Companion[]);
    setIsLoading(false);
  }, [appUser]);

  useEffect(() => { loadCompanions(); }, [loadCompanions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.topic) { toast.error("Fill required fields"); return; }
    if (!appUser) return;
    setCreating(true);
    try {
      const supabase = getSupabase();
      if (appUser.plan === "free" && appUser.sessions_this_month >= appUser.session_limit) throw new Error("Session limit reached. Upgrade to Pro.");
      await supabase.from("companions").insert({ user_id: appUser.id, ...formData } as any);
      toast.success("Companion created!");
      setShowForm(false);
      setFormData({ name: "", subject: "", topic: "", voice: "alloy", style: "professional", duration: 15 });
      loadCompanions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this companion?")) return;
    const supabase = getSupabase();
    await supabase.from("companions").delete().eq("id", id);
    setCompanions((prev) => prev.filter((c) => c.id !== id));
    toast.success("Deleted");
  };

  const handleStart = async (companionId: string) => {
    if (!appUser) return;
    const supabase = getSupabase();
    if (appUser.plan === "free" && appUser.sessions_this_month >= appUser.session_limit) { toast.error("Limit reached"); return; }
    const { data: session } = await (supabase.from("sessions") as any).insert({ user_id: appUser.id, companion_id: companionId, transcript: [] }).select().single();
    await (supabase.from("users") as any).update({ sessions_this_month: appUser.sessions_this_month + 1 }).eq("id", appUser.id);
    if (session) navigate(`/dashboard/companions/${companionId}?session=${session.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">AI Companions</h1><p className="text-muted-foreground">Create and manage your AI tutors.</p></div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="h-4 w-4" />New Companion</Button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 pb-0">
                <h2 className="text-xl font-semibold">Create New Companion</h2>
                <button onClick={() => setShowForm(false)} className="rounded-md p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <CardContent className="pt-4">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2"><Label>Name *</Label><Input placeholder="Professor Alex" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Select value={formData.subject} onValueChange={(v) => setFormData(p => ({...p, subject: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Topic *</Label><Input placeholder="Calculus Basics" value={formData.topic} onChange={(e) => setFormData(p => ({...p, topic: e.target.value}))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voice</Label>
                      <Select value={formData.voice} onValueChange={(v) => setFormData(p => ({...p, voice: v}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">Alloy</SelectItem><SelectItem value="echo">Echo</SelectItem>
                          <SelectItem value="fable">Fable</SelectItem><SelectItem value="onyx">Onyx</SelectItem>
                          <SelectItem value="nova">Nova</SelectItem><SelectItem value="shimmer">Shimmer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select value={formData.style} onValueChange={(v) => setFormData(p => ({...p, style: v}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem><SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="socratic">Socratic</SelectItem><SelectItem value="direct">Direct</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={String(formData.duration)} onValueChange={(v) => setFormData(p => ({...p, duration: parseInt(v)}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 min</SelectItem><SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={creating}>{creating ? "Creating..." : "Create Companion"}</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40" />)}</div>
        ) : companions.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16"><Bot className="mb-4 h-16 w-16 text-muted-foreground" /><h3 className="mb-2 text-xl font-semibold">No companions yet</h3><p className="mb-6 text-center text-muted-foreground">Create your first AI companion.</p><Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="h-4 w-4" />Create First Companion</Button></CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companions.map((c) => (
              <Card key={c.id} className="group relative">
                <CardHeader><CardTitle className="text-base">{c.name}</CardTitle><p className="text-sm text-muted-foreground">{c.subject} - {c.topic}</p></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{c.duration} min | {c.voice}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(c.id)} className="rounded-md px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">Delete</button>
                      <Button size="sm" onClick={() => handleStart(c.id)}><Mic className="mr-1 h-3 w-3" />Start</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
