import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, User, X, ChevronRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { authStore } from "@/utils/authStore";
import type { AuthUser } from "@/utils/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GRADES = ["Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [step, setStep]             = useState<1 | 2>(1);
  const [avatarPreview, setAvatar]  = useState<string | null>(null);
  const [form, setForm]             = useState({
    name: "", email: "", phone: "", parentPhone: "",
    grade: "", password: "", confirm: "",
  });
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);
  const { login }                   = useAppStore();
  const navigate                    = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateStep1 = (): string | null => {
    if (!form.name.trim())               return "Full name is required.";
    if (!form.email.includes("@"))       return "Enter a valid email address.";
    if (authStore.findByEmail(form.email)) return "This email is already registered.";
    if (!form.phone.match(/^01[0-9]{9}$/)) return "Enter a valid Egyptian phone number (01xxxxxxxxx).";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!form.grade)              return "Please select your grade.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords don't match.";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    const newUser: AuthUser = {
      id:          `student-reg-${Date.now()}`,
      name:        form.name.trim(),
      email:       form.email.trim().toLowerCase(),
      password:    form.password,
      role:        "student",
      avatar:      avatarPreview ?? `https://i.pravatar.cc/150?u=${form.email}`,
      phone:       form.phone,
      parentPhone: form.parentPhone || undefined,
      grade:       form.grade,
    };

    authStore.addUser(newUser);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));

    login(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: "student", avatar: newUser.avatar },
      `mock-jwt-student-${newUser.id}`,
    );
    navigate("/student");
    setLoading(false);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 gap-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <span className="text-4xl">✓</span>
        </motion.div>
        <p className="text-lg font-semibold">Account Created!</p>
        <p className="text-muted-foreground text-sm">Redirecting to your dashboard…</p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step === 2 && (
          <button
            type="button"
            onClick={() => { setStep(1); setError(""); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">Create account</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Step {step} of 2 — {step === 1 ? "Personal info" : "Academic & security"}
          </p>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="flex gap-1.5 mb-6">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <form
        onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}
        className="space-y-4"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center overflow-hidden ring-2 ring-border">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      : <User className="h-7 w-7 text-primary-foreground" />}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-3 w-3 text-primary-foreground" />
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Profile photo</p>
                  <p className="text-xs text-muted-foreground">Optional · JPG or PNG</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-name">Full name</Label>
                <Input id="reg-name" placeholder="Maya Johnson" value={form.name} onChange={set("name")} required className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email address</Label>
                <Input id="reg-email" type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} required className="bg-background/50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Your phone</Label>
                  <Input id="reg-phone" placeholder="01xxxxxxxxx" value={form.phone} onChange={set("phone")} required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-parent">Parent's phone</Label>
                  <Input id="reg-parent" placeholder="01xxxxxxxxx (optional)" value={form.parentPhone} onChange={set("parentPhone")} className="bg-background/50" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Grade / Year</Label>
                <Select value={form.grade} onValueChange={(v) => setForm((f) => ({ ...f, grade: v }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-pw">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-pw"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set("password")}
                    required
                    className="bg-background/50 pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        form.password.length >= i * 3
                          ? i <= 2 ? "bg-yellow-500" : i === 3 ? "bg-blue-500" : "bg-green-500"
                          : "bg-border"
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-cf">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="reg-cf"
                    type={showCf ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={set("confirm")}
                    required
                    className={`bg-background/50 pr-10 ${
                      form.confirm && form.confirm !== form.password ? "border-destructive" : ""
                    }`}
                  />
                  <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-destructive">Passwords don't match</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              {step === 1 ? "Checking…" : "Creating account…"}
            </span>
          ) : step === 1 ? (
            <span className="flex items-center gap-2">Next <ChevronRight className="h-4 w-4" /></span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
          Sign in
        </button>
      </p>
    </>
  );
};

export default RegisterForm;
