import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RsvpSection = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    attending: "",
    guestCount: 1,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!form.attending) {
      toast({ title: "Please select if you're attending", variant: "destructive" });
      return;
    }
    if (form.attending === "yes" && form.guestCount < 1) {
      toast({ title: "Please enter number of guests", variant: "destructive" });
      return;
    }

    setLoading(true);
    const trimmedName = form.fullName.trim().replace(/\s+/g, " ");

    const { error } = await supabase.from("rsvp_submissions").insert({
      full_name: trimmedName,
      mobile_number: form.mobileNumber.trim() || null,
      attendance_status: form.attending,
      guest_count: form.attending === "yes" ? form.guestCount : 0,
      message: form.message.trim() || null,
    });

    setLoading(false);
    if (error) {
      // Postgres unique violation
      if (error.code === "23505" || error.message?.toLowerCase().includes("duplicate")) {
        toast({
          title: "This name has already RSVP'd 🦕",
          description: "Looks like someone with this name already responded. Please double-check or use a different name.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  return (
    <section className="py-16 px-4 relative z-10" id="rsvp">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-heading text-primary mb-2">RSVP</h2>
          <p className="text-muted-foreground font-body">Let us know if you can make it! 🦖</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">🦖</div>
                <h3 className="font-heading text-2xl text-primary mb-2">Thank You!</h3>
                <p className="text-muted-foreground font-body">
                  We're excited to celebrate with you! See you at the christening! 🎉
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <Label className="font-body font-semibold text-foreground">Full Name *</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="mt-1.5 rounded-xl font-body"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <Label className="font-body font-semibold text-foreground">Mobile Number</Label>
                  <Input
                    placeholder="Optional"
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    className="mt-1.5 rounded-xl font-body"
                    maxLength={20}
                  />
                </div>

                <div>
                  <Label className="font-body font-semibold text-foreground">Will you attend? *</Label>
                  <div className="flex gap-3 mt-1.5">
                    {[
                      { value: "yes", label: "Yes, I'll be there! 🎉", emoji: "🦕" },
                      { value: "no", label: "Sorry, can't make it 😢", emoji: "💌" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, attending: opt.value })}
                        className={`flex-1 p-3 rounded-xl border-2 text-sm font-body font-semibold transition-all duration-200 ${
                          form.attending === opt.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <span className="block text-2xl mb-1">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {form.attending === "yes" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Label className="font-body font-semibold text-foreground">Number of Guests *</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={form.guestCount}
                        onChange={(e) => setForm({ ...form, guestCount: parseInt(e.target.value) || 1 })}
                        className="mt-1.5 rounded-xl font-body"
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <Label className="font-body font-semibold text-foreground">Message for Baby Cael 💌</Label>
                  <Textarea
                    placeholder="Write a short blessing or message (optional)"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-1.5 rounded-xl font-body resize-none"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full py-6 text-lg font-heading shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? "Sending..." : "Send RSVP 🦖"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default RsvpSection;
