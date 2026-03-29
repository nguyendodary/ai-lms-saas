import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { toast } from "sonner";
import type { Companion, TranscriptMessage } from "@/types";

export default function SessionPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const navigate = useNavigate();

  const [companion, setCompanion] = useState<Companion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ending">("idle");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const supabase = getSupabase();
      const { data } = await supabase.from("companions").select("*").eq("id", id).single();
      setCompanion(data as Companion | null);
      setIsLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const saveTranscript = useCallback(async (msgs: TranscriptMessage[]) => {
    if (!sessionId) return;
    const supabase = getSupabase();
    await (supabase.from("sessions") as any).update({ transcript: msgs }).eq("id", sessionId);
  }, [sessionId]);

  const startCall = useCallback(async () => {
    setCallStatus("connecting");
    // Simulate connection for demo - replace with actual Vapi integration
    setTimeout(() => {
      setCallStatus("active");
      toast.success("Session started");
      const welcomeMsg: TranscriptMessage = { role: "assistant", content: `Hello! I'm ${companion?.name || "your AI tutor"}. What would you like to learn about ${companion?.topic || "today"}?`, timestamp: new Date().toISOString() };
      setTranscript([welcomeMsg]);
    }, 1500);
  }, [companion]);

  const endCall = useCallback(async () => {
    setCallStatus("idle");
    if (sessionId) {
      const supabase = getSupabase();
      await (supabase.from("sessions") as any).update({ ended_at: new Date().toISOString(), duration: 5, transcript }).eq("id", sessionId);
    }
    toast.info("Session ended");
    navigate("/dashboard/sessions");
  }, [sessionId, transcript, navigate]);

  if (isLoading) {
    return <DashboardLayout><div className="flex gap-6"><Skeleton className="w-80 h-96" /><Skeleton className="flex-1 h-96" /></div></DashboardLayout>;
  }

  if (!companion || !sessionId) {
    return <DashboardLayout><p className="text-muted-foreground">Session not found.</p></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Learning Session</h1><p className="text-muted-foreground">{companion.name} - {companion.subject}</p></div>
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="lg:w-80">
            <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5" />{companion.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <div className={`absolute inset-0 rounded-full transition-all ${callStatus === "active" ? "bg-primary/20 animate-pulse" : "bg-muted"}`} />
                  <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
                    {callStatus === "active" ? <Mic className="h-8 w-8 text-primary-foreground" /> : <MicOff className="h-8 w-8 text-primary-foreground/50" />}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{companion.subject} - {companion.topic}</p>
                <p className="text-xs text-muted-foreground capitalize">Style: {companion.style} | Voice: {companion.voice}</p>
              </div>
              <div className="flex flex-col gap-2">
                {callStatus === "idle" && <Button onClick={startCall} className="w-full" size="lg"><Mic className="mr-2 h-4 w-4" />Start Session</Button>}
                {callStatus === "connecting" && <Button disabled className="w-full" size="lg"><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Connecting...</Button>}
                {callStatus === "active" && (
                  <>
                    <Button onClick={() => setIsMuted(!isMuted)} variant="outline" className="w-full">{isMuted ? <><MicOff className="mr-2 h-4 w-4" />Unmute</> : <><Mic className="mr-2 h-4 w-4" />Mute</>}</Button>
                    <Button onClick={endCall} variant="destructive" className="w-full"><PhoneOff className="mr-2 h-4 w-4" />End Session</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader><CardTitle>Live Transcript</CardTitle></CardHeader>
            <CardContent className="overflow-y-auto max-h-[600px]">
              {transcript.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground"><p>Start a session to see transcript...</p></div>
              ) : (
                <div className="space-y-4">
                  {transcript.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="text-xs font-medium mb-1">{msg.role === "user" ? "You" : companion.name}</p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
