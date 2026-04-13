import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BUCKET = "baby-photos";
const FILE_NAME = "baby-photo";

const BabyPhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadExistingPhoto();
  }, []);

  const loadExistingPhoto = async () => {
    const { data } = await supabase.storage.from(BUCKET).list("", { limit: 10 });
    const file = data?.find((f) => f.name.startsWith(FILE_NAME));
    if (file) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(file.name);
      setPhotoUrl(urlData.publicUrl + "?t=" + Date.now());
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${FILE_NAME}.${ext}`;

    // Remove old photos first
    const { data: existing } = await supabase.storage.from(BUCKET).list("");
    if (existing?.length) {
      await supabase.storage.from(BUCKET).remove(existing.map((f) => f.name));
    }

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
    } else {
      toast.success("Baby photo uploaded! 🦕");
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      setPhotoUrl(urlData.publicUrl + "?t=" + Date.now());
    }
    setUploading(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-heading text-xl text-primary mb-4">📸 Baby Photo</h2>
      <p className="text-sm font-body text-muted-foreground mb-4">
        Upload a photo to display on the website after the event details section.
      </p>

      {photoUrl && (
        <div className="mb-4">
          <img
            src={photoUrl}
            alt="Baby photo preview"
            className="w-full max-w-xs rounded-2xl border border-border shadow-sm object-cover"
          />
        </div>
      )}

      <label className="inline-block">
        <Button asChild disabled={uploading} className="rounded-full font-heading cursor-pointer">
          <span>{uploading ? "Uploading..." : photoUrl ? "Change Photo 🦖" : "Upload Photo 🦖"}</span>
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default BabyPhotoUpload;
