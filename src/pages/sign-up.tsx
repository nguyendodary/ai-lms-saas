import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error, needsConfirmation } = await signUp(email, password, firstName, lastName);
      if (error) {
        toast.error(error.message);
      } else if (needsConfirmation) {
        toast.success("Account created! Check your email to verify, then sign in.");
        navigate("/sign-in");
      } else {
        toast.success("Account created!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">A</div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">Start learning with AI companions</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>First Name</Label><Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Creating..." : "Sign Up"}</Button>
          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/sign-in" className="text-primary hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
