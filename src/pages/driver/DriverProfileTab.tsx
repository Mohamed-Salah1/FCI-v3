import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { DriverProfile } from "@/utils/data";

const DriverProfileTab = ({ profile }: { profile: DriverProfile }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ ...profile, password: "", confirmPassword: "" });

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength <= 1) return { label: "Weak", color: "bg-destructive", width: "33%" };
    if (strength === 2) return { label: "Medium", color: "bg-warning", width: "66%" };
    return { label: "Strong", color: "bg-success", width: "100%" };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card rounded-2xl p-6 text-center space-y-4">
        <img src={profile.avatar} alt={profile.name} className="h-16 w-16 rounded-full mx-auto object-cover" />
        <div>
          <h2 className="font-bold text-xl">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">Driver • {profile.busNumber}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input disabled={!isEditing} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input disabled={!isEditing} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input disabled={!isEditing} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>License Number</Label>
          <Input disabled={!isEditing} value={formData.license} onChange={(e) => setFormData({ ...formData, license: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Bus Number</Label>
          <Input disabled value={formData.busNumber} />
        </div>
        {isEditing && (
          <>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Enter new password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-border rounded">
                    <div className={`h-1.5 rounded transition-all ${getPasswordStrength(formData.password).color}`} style={{ width: getPasswordStrength(formData.password).width }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className="font-medium">{getPasswordStrength(formData.password).label}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (formData.password && formData.password !== formData.confirmPassword) {
                  toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
                  return;
                }
                setIsEditing(false);
                toast({ title: "Profile Updated", description: "Changes saved successfully" });
              }}
            >
              Save Changes
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DriverProfileTab;
