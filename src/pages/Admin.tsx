import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSettingsEditor from "@/components/AdminSettingsEditor";
import BabyPhotoUpload from "@/components/BabyPhotoUpload";
import AdminWishlistManager from "@/components/AdminWishlistManager";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RsvpEntry {
  id: string;
  full_name: string;
  mobile_number: string | null;
  attendance_status: string;
  guest_count: number | null;
  message: string | null;
  created_at: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteRsvp = async (id: string, name: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("rsvp_submissions").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
      return;
    }
    setRsvps((prev) => prev.filter((r) => r.id !== id));
    toast({ title: `Removed ${name}'s RSVP 🦕` });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (authenticated) fetchRsvps();
  }, [authenticated]);

  const fetchRsvps = async () => {
    const { data } = await supabase
      .from("rsvp_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRsvps(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError("Invalid credentials");
      return;
    }
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center font-body text-muted-foreground">Loading...</div>;

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-background">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-sm border border-border space-y-4">
          <h2 className="font-heading text-2xl text-primary text-center">Admin Login 🦕</h2>
          {loginError && <p className="text-sm text-destructive text-center font-body">{loginError}</p>}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl font-body"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl font-body"
            required
          />
          <Button type="submit" className="w-full rounded-full font-heading">Sign In</Button>
        </form>
      </div>
    );
  }

  const confirmed = rsvps.filter((r) => r.attendance_status === "yes");
  const declined = rsvps.filter((r) => r.attendance_status === "no");
  const totalHeadcount = confirmed.reduce((sum, r) => sum + (r.guest_count || 0), 0);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-primary">RSVP Dashboard 🦖</h1>
          <Button variant="outline" onClick={handleLogout} className="rounded-full font-body">
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total RSVPs", value: rsvps.length, color: "bg-dino-blue/20" },
            { label: "Attending", value: confirmed.length, color: "bg-dino-green/20" },
            { label: "Declined", value: declined.length, color: "bg-dino-orange/20" },
            { label: "Expected Guests", value: totalHeadcount, color: "bg-dino-yellow/20" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-2xl p-5 text-center border border-border`}>
              <div className="font-heading text-3xl text-foreground">{stat.value}</div>
              <div className="font-body text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Event Settings */}
        <div className="mb-8">
          <AdminSettingsEditor />
        </div>

        {/* Baby Photo Upload */}
        <div className="mb-8">
          <BabyPhotoUpload />
        </div>

        {/* Wishlist Manager */}
        <div className="mb-8">
          <AdminWishlistManager />
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-semibold text-foreground">Name</th>
                  <th className="text-left p-3 font-semibold text-foreground">Status</th>
                  <th className="text-left p-3 font-semibold text-foreground">Guests</th>
                  <th className="text-left p-3 font-semibold text-foreground hidden md:table-cell">Mobile</th>
                  <th className="text-left p-3 font-semibold text-foreground hidden md:table-cell">Message</th>
                  <th className="text-left p-3 font-semibold text-foreground">Date</th>
                  <th className="text-right p-3 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No RSVP submissions yet 🥚
                    </td>
                  </tr>
                ) : (
                  rsvps.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{r.full_name}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            r.attendance_status === "yes"
                              ? "bg-dino-green/20 text-dino-leaf"
                              : "bg-dino-orange/20 text-accent-foreground"
                          }`}
                        >
                          {r.attendance_status === "yes" ? "Attending" : "Declined"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{r.guest_count || "-"}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{r.mobile_number || "-"}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                        {r.message || "-"}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
