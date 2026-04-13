import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";

const BUCKET = "baby-photos";

const BabyPhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const { data } = await supabase.storage.from(BUCKET).list("", { limit: 50 });
    if (!data) return;
    const items = data
      .filter((f) => !f.name.startsWith("."))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
        return { name: f.name, url: urlData.publicUrl + "?t=" + Date.now() };
      });
    setPhotos(items);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const fileName = `baby-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, { upsert: true });
      if (error) toast.error("Upload failed: " + error.message);
    }
    toast.success("Photos uploaded! 🦕");
    await loadPhotos();
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (name: string) => {
    await supabase.storage.from(BUCKET).remove([name]);
    toast.success("Photo removed");
    setPhotos((prev) => prev.filter((p) => p.name !== name));
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-heading text-xl text-primary mb-4">📸 Baby Photos</h2>
      <p className="text-sm font-body text-muted-foreground mb-4">
        Upload photos to display in the carousel on the website.
      </p>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {photos.map((p) => (
            <div key={p.name} className="relative group">
              <img
                src={p.url}
                alt="Baby"
                className="w-full h-24 object-cover rounded-xl border border-border"
              />
              <button
                onClick={() => handleDelete(p.name)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-block">
        <Button asChild disabled={uploading} className="rounded-full font-heading cursor-pointer">
          <span>{uploading ? "Uploading..." : "Add Photos 🦖"}</span>
        </Button>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default BabyPhotoUpload;
