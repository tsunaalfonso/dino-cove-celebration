import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy, ExternalLink } from "lucide-react";

const SHARE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share`;
const FB_DEBUGGER = `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(SHARE_URL)}`;

const AdminOgRefresh = () => {
  const { toast } = useToast();
  const [version, setVersion] = useState<string>("…");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("event_settings")
      .select("value")
      .eq("key", "og_version")
      .maybeSingle();
    setVersion(data?.value ?? "1");
  };

  useEffect(() => {
    load();
  }, []);

  const bump = async () => {
    setLoading(true);
    const next = String((parseInt(version, 10) || 0) + 1);
    const { error } = await supabase
      .from("event_settings")
      .update({ value: next, updated_at: new Date().toISOString() })
      .eq("key", "og_version");
    setLoading(false);
    if (error) {
      toast({ title: "Failed to refresh preview", description: error.message, variant: "destructive" });
      return;
    }
    setVersion(next);
    toast({ title: "Preview refreshed 🦕", description: `Share image bumped to v${next}` });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(SHARE_URL);
    toast({ title: "Share link copied 📋" });
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <div>
        <h3 className="font-heading text-xl text-primary">Social Share Preview 📣</h3>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Bump the version to force Messenger / Facebook to re-fetch the preview image. Share the link below — never the homepage URL — to guarantee a fresh thumbnail.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="font-body text-sm">
          Current version: <span className="font-semibold text-foreground">v{version}</span>
        </div>
        <Button
          onClick={bump}
          disabled={loading}
          className="rounded-full font-heading"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Preview
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input readOnly value={SHARE_URL} className="rounded-xl font-mono text-xs" />
        <Button variant="outline" size="icon" onClick={copy} className="rounded-full" aria-label="Copy share link">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" asChild className="rounded-full" aria-label="Open Facebook debugger">
          <a href={FB_DEBUGGER} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
      <p className="font-body text-xs text-muted-foreground">
        Tip: open the Facebook debugger and click <em>Scrape Again</em> for an instant refresh.
      </p>
    </div>
  );
};

export default AdminOgRefresh;
