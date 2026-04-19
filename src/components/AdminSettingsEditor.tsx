import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parseDressCodeColors, serializeDressCodeColors, type DressCodeColor } from "@/lib/dressCodeColors";

interface SettingField {
  key: string;
  label: string;
  type: "input" | "textarea";
}

const FIELDS: SettingField[] = [
  { key: "event_date", label: "Event Date (YYYY-MM-DD)", type: "input" },
  { key: "event_time", label: "Event Time", type: "input" },
  { key: "ceremony_venue", label: "Ceremony Venue", type: "input" },
  { key: "ceremony_address", label: "Ceremony Address", type: "input" },
  { key: "ceremony_time", label: "Ceremony Time Range", type: "input" },
  { key: "reception_venue", label: "Reception Venue", type: "input" },
  { key: "reception_address", label: "Reception Address", type: "input" },
  { key: "reception_time", label: "Reception Time Range", type: "input" },
  { key: "map_embed_url", label: "Church Map — Google Maps Embed URL", type: "textarea" },
  { key: "map_direct_link", label: "Church Map — Google Maps Direct Link", type: "input" },
  { key: "reception_map_embed_url", label: "Reception Map — Google Maps Embed URL", type: "textarea" },
  { key: "reception_map_direct_link", label: "Reception Map — Google Maps Direct Link", type: "input" },
  { key: "dress_code", label: "Dress Code", type: "input" },
  { key: "special_note", label: "Special Note", type: "textarea" },
];

const AdminSettingsEditor = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [dressColors, setDressColors] = useState<DressCodeColor[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("event_settings")
      .select("key, value")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((row: { key: string; value: string }) => {
            map[row.key] = row.value;
          });
          setValues(map);
          setDressColors(parseDressCodeColors(map["dress_code_color"]));
        }
        setLoaded(true);
      });
  }, []);

  const updateColor = (idx: number, patch: Partial<DressCodeColor>) => {
    setDressColors((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };
  const addColor = () => {
    if (dressColors.length >= 3) return;
    setDressColors((prev) => [...prev, { name: "", hex: "#A8D5BA" }]);
  };
  const removeColor = (idx: number) => {
    setDressColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        ...values,
        dress_code_color: serializeDressCodeColors(dressColors),
      };
      const promises = Object.entries(payload).map(([key, value]) =>
        supabase
          .from("event_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key)
      );
      await Promise.all(promises);
      toast.success("Event settings saved! 🦕");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  if (!loaded) return <p className="text-muted-foreground font-body text-center py-4">Loading settings...</p>;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-heading text-xl text-primary mb-5">⚙️ Event Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <label className="block text-sm font-body font-semibold text-foreground mb-1">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <Textarea
                value={values[field.key] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                className="rounded-xl font-body text-sm"
                rows={3}
              />
            ) : (
              <Input
                value={values[field.key] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                className="rounded-xl font-body"
              />
            )}
          </div>
        ))}
      </div>

      {/* Dress code colors editor */}
      <div className="mt-6 pt-5 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-body font-semibold text-foreground">
            👗 Dress Code Colors (up to 3)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addColor}
            disabled={dressColors.length >= 3}
            className="rounded-full font-body"
          >
            + Add Color
          </Button>
        </div>
        <div className="space-y-3">
          {dressColors.length === 0 && (
            <p className="text-xs font-body text-muted-foreground">No colors yet. Click "Add Color" to start.</p>
          )}
          {dressColors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
              <input
                type="color"
                value={color.hex || "#A8D5BA"}
                onChange={(e) => updateColor(idx, { hex: e.target.value })}
                className="h-11 w-14 rounded-lg border border-input cursor-pointer bg-background flex-shrink-0"
                aria-label={`Color ${idx + 1} picker`}
              />
              <Input
                value={color.name}
                onChange={(e) => updateColor(idx, { name: e.target.value })}
                placeholder="Color name (e.g. Sage Green)"
                className="rounded-xl font-body flex-1"
              />
              <Input
                value={color.hex}
                onChange={(e) => updateColor(idx, { hex: e.target.value })}
                placeholder="#A8D5BA"
                className="rounded-xl font-body w-28"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeColor(idx)}
                className="rounded-full text-destructive hover:text-destructive"
                aria-label="Remove color"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="mt-5 rounded-full font-heading">
        {saving ? "Saving..." : "Save Settings 🦖"}
      </Button>
    </div>
  );
};

export default AdminSettingsEditor;
