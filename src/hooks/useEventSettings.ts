import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_CONFIG } from "@/lib/eventConfig";

export interface EventSettings {
  event_date: string;
  event_time: string;
  ceremony_venue: string;
  ceremony_address: string;
  ceremony_time: string;
  reception_venue: string;
  reception_address: string;
  reception_time: string;
  map_embed_url: string;
  map_direct_link: string;
  dress_code: string;
  special_note: string;
}

const DEFAULTS: EventSettings = {
  event_date: EVENT_CONFIG.eventDate,
  event_time: EVENT_CONFIG.eventTime,
  ceremony_venue: EVENT_CONFIG.ceremony.venue,
  ceremony_address: EVENT_CONFIG.ceremony.address,
  ceremony_time: EVENT_CONFIG.ceremony.time,
  reception_venue: EVENT_CONFIG.reception.venue,
  reception_address: EVENT_CONFIG.reception.address,
  reception_time: EVENT_CONFIG.reception.time,
  map_embed_url: EVENT_CONFIG.map.embedUrl,
  map_direct_link: EVENT_CONFIG.map.directLink,
  dress_code: EVENT_CONFIG.dressCode,
  special_note: EVENT_CONFIG.specialNote,
};

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("event_settings")
      .select("key, value")
      .then(({ data }) => {
        if (data) {
          const merged = { ...DEFAULTS };
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
