import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface Godparent {
  id: string;
  role: "ninong" | "ninang";
  name: string;
  sort_order: number;
}

const AdminGodparentsManager = () => {
  const [items, setItems] = useState<Godparent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"ninong" | "ninang">("ninong");
  const [adding, setAdding] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("godparents")
      .select("*")
      .order("role", { ascending: true })
      .order("sort_order", { ascending: true });
    if (data) setItems(data as Godparent[]);
    setLoaded(true);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const sameRole = items.filter((i) => i.role === newRole);
    const nextOrder = sameRole.length > 0 ? Math.max(...sameRole.map((i) => i.sort_order)) + 1 : 0;
    const { error } = await supabase.from("godparents").insert({
      role: newRole,
      name: newName.trim(),
      sort_order: nextOrder,
    });
    setAdding(false);
    if (error) {
      toast.error("Failed to add");
      return;
    }
    setNewName("");
    toast.success(`Added ${newRole === "ninong" ? "Ninong" : "Ninang"} 🦕`);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("godparents").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Removed");
  };

  const handleRename = async (id: string, name: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
  };

  const saveRename = async (id: string, name: string) => {
    if (!name.trim()) return;
    await supabase.from("godparents").update({ name: name.trim() }).eq("id", id);
  };

  const move = async (id: string, dir: -1 | 1) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const sameRole = items.filter((i) => i.role === item.role).sort((a, b) => a.sort_order - b.sort_order);
    const idx = sameRole.findIndex((i) => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sameRole.length) return;
    const other = sameRole[swapIdx];
    await Promise.all([
      supabase.from("godparents").update({ sort_order: other.sort_order }).eq("id", item.id),
      supabase.from("godparents").update({ sort_order: item.sort_order }).eq("id", other.id),
    ]);
    fetchItems();
  };

  if (!loaded) return <p className="text-muted-foreground font-body text-center py-4">Loading godparents...</p>;

  const ninongs = items.filter((i) => i.role === "ninong").sort((a, b) => a.sort_order - b.sort_order);
  const ninangs = items.filter((i) => i.role === "ninang").sort((a, b) => a.sort_order - b.sort_order);

  const renderList = (list: Godparent[], label: string, emoji: string) => (
    <div>
      <h3 className="font-heading text-base text-foreground mb-2">
        {emoji} {label} <span className="text-muted-foreground text-sm">({list.length})</span>
      </h3>
      <div className="space-y-2">
        {list.length === 0 && (
          <p className="text-xs font-body text-muted-foreground italic">No {label.toLowerCase()} added yet.</p>
        )}
        {list.map((g) => (
          <div key={g.id} className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background">
            <Input
              value={g.name}
              onChange={(e) => handleRename(g.id, e.target.value)}
              onBlur={(e) => saveRename(g.id, e.target.value)}
              className="rounded-lg font-body flex-1 h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => move(g.id, -1)}
              className="h-8 w-8 rounded-full"
              aria-label="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => move(g.id, 1)}
              className="h-8 w-8 rounded-full"
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(g.id)}
              className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-heading text-xl text-primary mb-5">👫 Ninongs & Ninangs</h2>

      {/* Add new */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 p-3 rounded-xl bg-muted/40 border border-border">
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as "ninong" | "ninang")}
          className="rounded-xl border border-input bg-background px-3 h-10 font-body text-sm"
        >
          <option value="ninong">Ninong</option>
          <option value="ninang">Ninang</option>
        </select>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Full name"
          className="rounded-xl font-body flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button onClick={handleAdd} disabled={adding || !newName.trim()} className="rounded-full font-heading">
          {adding ? "Adding..." : "Add 🦖"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {renderList(ninongs, "Ninongs", "🤵")}
        {renderList(ninangs, "Ninangs", "👰")}
      </div>
    </div>
  );
};

export default AdminGodparentsManager;
