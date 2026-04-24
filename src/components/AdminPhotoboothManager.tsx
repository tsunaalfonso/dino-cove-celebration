import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PHOTOBOOTH_DEFAULTS, type PhotoboothSettings } from "@/hooks/usePhotoboothSettings";

const TEXT_FIELDS: { key: keyof PhotoboothSettings; label: string; type: "input" | "textarea" }[] = [
  { key: "pb_title", label: "Name on Frame", type: "input" },
  { key: "pb_subtitle", label: "Subtitle (under name)", type: "textarea" },
  { key: "pb_button_label", label: "Floating Button Label", type: "input" },
  { key: "pb_top_left_emoji", label: "Top-Left Emoji", type: "input" },
  { key: "pb_top_right_emoji", label: "Top-Right Emoji", type: "input" },
];

const COLOR_FIELDS: { key: keyof PhotoboothSettings; label: string }[] = [
  { key: "pb_border_color_1", label: "Frame Color 1 (start)" },
  { key: "pb_border_color_2", label: "Frame Color 2 (middle)" },
  { key: "pb_border_color_3", label: "Frame Color 3 (end)" },
  { key: "pb_name_color", label: "Name Text Color" },
  { key: "pb_subtitle_color", label: "Subtitle Text Color" },
];

const AdminPhotoboothManager = () => {
  const [values, setValues] = useState<PhotoboothSettings>(PHOTOBOOTH_DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("event_settings")
      .select("key, value")
      .like("key", "pb_%")
      .then(({ data }) => {
        const merged = { ...PHOTOBOOTH_DEFAULTS };
        data?.forEach((row: { key: string; value: string }) => {
          if (row.key in merged) (merged as Record<string, string>)[row.key] = row.value;
        });
        setValues(merged);
        setLoaded(true);
      });
  }, []);

  const update = (key: keyof PhotoboothSettings, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
      const { error } = await supabase
        .from("event_settings")
        .upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast.success("Photobooth layout saved! 📸");
    } catch (e) {
      toast.error("Failed to save photobooth settings");
      console.error(e);
    }
    setSaving(false);
  };

  if (!loaded) return <p className="text-muted-foreground font-body text-center py-4">Loading photobooth...</p>;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-heading text-xl text-primary mb-1">📸 Photobooth Layout</h2>
      <p className="text-sm font-body text-muted-foreground mb-5">
        Customize the dino photobooth frame, text and button.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {TEXT_FIELDS.map((f) => (
          <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
            <label className="block text-sm font-body font-semibold text-foreground mb-1">
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <Textarea
                value={values[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="rounded-xl font-body text-sm"
                rows={2}
              />
            ) : (
              <Input
                value={values[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="rounded-xl font-body"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-border">
        <h3 className="text-sm font-body font-semibold text-foreground mb-3">🎨 Frame Colors</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
              <input
                type="color"
                value={values[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="h-11 w-14 rounded-lg border border-input cursor-pointer bg-background flex-shrink-0"
                aria-label={f.label}
              />
              <div className="flex-1">
                <p className="text-xs font-body font-semibold text-foreground">{f.label}</p>
                <Input
                  value={values[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="rounded-lg font-body text-xs h-8 mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 pt-5 border-t border-border">
        <h3 className="text-sm font-body font-semibold text-foreground mb-3">👀 Preview</h3>
        <div
          className="relative w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden bg-muted"
          style={{
            border: "6px solid transparent",
            backgroundImage: `linear-gradient(hsl(var(--muted)), hsl(var(--muted))), linear-gradient(135deg, ${values.pb_border_color_1}, ${values.pb_border_color_2}, ${values.pb_border_color_3})`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <span className="absolute top-2 left-2 text-2xl">{values.pb_top_left_emoji}</span>
          <span className="absolute top-2 right-2 text-2xl">{values.pb_top_right_emoji}</span>
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-body">
            (camera preview)
          </div>
          <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-card/90 px-2 py-1.5 text-center">
            <p className="font-heading text-xs leading-tight" style={{ color: values.pb_name_color }}>
              {values.pb_title}
            </p>
            <p className="font-body text-[9px]" style={{ color: values.pb_subtitle_color }}>
              {values.pb_subtitle}
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="mt-6 rounded-full font-heading">
        {saving ? "Saving..." : "Save Photobooth 📸"}
      </Button>
    </div>
  );
};

export default AdminPhotoboothManager;
