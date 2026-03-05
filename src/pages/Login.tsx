import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { mockDrivers, mockStudents } from "@/utils/mockData";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Check admin
    if (email === "admin@bustrack.io" && password === "admin") {
      login({ id: "user-admin", name: "Admin User", email, role: "admin" }, "demo-jwt-token-admin");
      navigate("/admin");
      setLoading(false);
      return;
    }

    // Check drivers
    const driver = mockDrivers.find((d) => d.email === email);
    if (driver && password === "driver") {
      login({ id: driver.id, name: driver.name, email: driver.email, role: "driver" }, "demo-jwt-token-driver");
      navigate("/driver");
      setLoading(false);
      return;
    }

    // Check students
    const student = mockStudents.find((s) => s.email === email);
    if (student && password === "student") {
      login({ id: student.id, name: student.name, email: student.email, role: "student" }, "demo-jwt-token-student");
      navigate("/student");
      setLoading(false);
      return;
    }

    setError("Invalid credentials. Use driver@bustrack.io/driver, student@bustrack.io/student, or admin@bustrack.io/admin");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-dark">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl gradient-primary items-center justify-center mb-4 glow-primary">
            <Bus className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">BusTrack Pro</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart School Bus Tracking System</p>
        </div>
        <div className="glass-card-strong rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
          </form>
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>🔑 Admin: admin@bustrack.io / admin</p>
              <p>🚌 Driver: driver@bustrack.io / driver</p>
              <p>🎓 Student: student@bustrack.io / student</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
