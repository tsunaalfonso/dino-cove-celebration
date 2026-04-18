import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Check, Gift, Upload, X } from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  link: string | null;
  image_url: string | null;
  claimed: boolean;
}

const AdminWishlistManager = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("wishlist_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (data) setItems(data as WishlistItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearForm = () => {
    setName("");
    setLink("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Gift name is required");
      return;
    }

    // Duplicate check: Case-insensitive exact match
    const isDuplicate = items.some(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error("A gift with this name already exists in the wishlist");
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("wishlist-images")
          .upload(path, imageFile);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("wishlist-images").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
      const { error } = await supabase.from("wishlist_items").insert({
        name: name.trim(),
        link: link.trim() || null,
        image_url: imageUrl,
        sort_order: items.length,
      });
      if (error) throw error;
      toast.success("Gift added to wishlist! 🎁");
      clearForm();
      fetchItems();
    } catch {
      toast.error("Failed to add gift");
    }
    setSaving(false);
  };

  const toggleClaimed = async (item: WishlistItem) => {
    const { error } = await supabase
      .from("wishlist_items")
      .update({ claimed: !item.claimed })
      .eq("id", item.id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    fetchItems();
  };

  const handleDelete = async (item: WishlistItem) => {
    if (!confirm(`Remove "${item.name}" from wishlist?`)) return;
    if (item.image_url) {
      const path = item.image_url.split("/wishlist-images/")[1];
      if (path) await supabase.storage.from("wishlist-images").remove([path]);
    }
    const { error } = await supabase.from("wishlist_items").delete().eq("id", item.id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Gift removed");
    fetchItems();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-heading text-xl text-primary mb-5 flex items-center gap-2">
        <Gift className="w-5 h-5" /> Avery's Wishlist
      </h2>

      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <div>
          <Label className="font-body font-semibold text-foreground text-sm">Gift Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Soft dino plushie"
            className="mt-1 rounded-xl font-body"
            maxLength={120}
          />
        </div>
        <div>
          <Label className="font-body font-semibold text-foreground text-sm">Store / Registry Link</Label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="mt-1 rounded-xl font-body"
            maxLength={500}
          />
        </div>
        <div className="md:col-span-2">
          <Label className="font-body font-semibold text-foreground text-sm">Gift Image</Label>
          <div className="mt-1 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-border bg-background px-4 py-2 text-sm font-body hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" />
              {imageFile ? "Change image" : "Choose image"}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            {imagePreview && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-lg p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Button onClick={handleAdd} disabled={saving} className="rounded-full font-heading mb-6">
        {saving ? "Adding..." : "Add Gift 🎁"}
      </Button>

      {loading ? (
        <p className="text-muted-foreground font-body text-sm text-center py-4">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground font-body text-sm text-center py-4">
          No wishlist items yet. Add the first gift above! 🥚
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 rounded-xl border border-border bg-background"
            >
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Gift className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-foreground text-sm truncate">{item.name}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate block"
                  >
                    {item.link}
                  </a>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => toggleClaimed(item)}
                    className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full transition-colors ${
                      item.claimed
                        ? "bg-dino-green/20 text-dino-leaf"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    <Check className="w-3 h-3" /> {item.claimed ? "Claimed" : "Mark claimed"}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-destructive hover:bg-destructive/10 rounded-full p-1 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWishlistManager;
