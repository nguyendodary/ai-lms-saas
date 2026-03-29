import { ArrowRight, Mic, Bot, BarChart3, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">A</div>
            <span className="text-lg font-semibold">AI LMS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/sign-in"><Button variant="ghost">Sign In</Button></Link>
            <Link to="/sign-up"><Button>Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Learn Anything with <span className="text-primary">AI-Powered</span> Voice Companions
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Real-time AI tutoring with voice conversations. Create personalized learning companions and master any subject.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/sign-up">
              <Button size="lg" className="gap-2">Start Learning Free <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/pricing"><Button size="lg" variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">Everything you need to learn effectively</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Mic, title: "Real-time Voice AI", desc: "Have natural voice conversations with AI tutors." },
            { icon: Bot, title: "Custom Companions", desc: "Create AI tutors for any subject with different styles." },
            { icon: BarChart3, title: "Learning Analytics", desc: "Track your progress with detailed analytics." },
            { icon: Sparkles, title: "Personalized Learning", desc: "AI adapts to your learning style and pace." },
            { icon: Shield, title: "Progress Tracking", desc: "Review session transcripts and feedback." },
            { icon: Bot, title: "13+ Subjects", desc: "From math to music, learn anything." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 hover:shadow-md transition-all">
              <f.icon className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto flex h-16 items-center justify-center px-4 text-sm text-muted-foreground">
          <p>&copy; 2026 AI LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
