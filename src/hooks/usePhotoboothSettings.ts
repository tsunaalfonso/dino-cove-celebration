import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PhotoboothSettings {
  pb_title: string;
  pb_subtitle: string;
  pb_top_left_emoji: string;
  pb_top_right_emoji: string;
  pb_border_color_1: string;
  pb_border_color_2: string;
  pb_border_color_3: string;
  pb_name_color: string;
  pb_subtitle_color: string;
  pb_button_label: string;
}

export const PHOTOBOOTH_DEFAULTS: PhotoboothSettings = {
  pb_title: "CAEL AVERY M. ALFONSO",
  pb_subtitle: "🦕 Our Little Dino • Christening 🦕",
  pb_top_left_emoji: "🦕",
  pb_top_right_emoji: "🥚",
  pb_border_color_1: "#A8DADC",
  pb_border_color_2: "#F6E27F",
  pb_border_color_3: "#F4A261",
  pb_name_color: "#3A6E4B",
  pb_subtitle_color: "#7A5A2E",
  pb_button_label: "Photobooth",
};

export function usePhotoboothSettings() {
  const [settings, setSettings] = useState<PhotoboothSettings>(PHOTOBOOTH_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("event_settings")
      .select("key, value")
      .like("key", "pb_%")
      .then(({ data }) => {
        if (data) {
          const merged = { ...PHOTOBOOTH_DEFAULTS };
          data.forEach((row: { key: string; value: string }) => {
            if (row.key in merged) {
              (merged as Record<string, string>)[row.key] = row.value;
            }
          });
          setSettings(merged);
        }
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
