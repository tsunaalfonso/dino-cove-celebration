// Public edge function that returns an HTML page with fresh Open Graph
// meta tags for Messenger / Facebook / Twitter scrapers.
// Whenever the admin bumps `og_version` in event_settings, sharing the
// /share URL forces social platforms to re-scrape a new image.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE_URL = "https://dino-cove-celebration.lovable.app";
const TITLE = "Cael Avery's Christening | RSVP";
const DESCRIPTION =
  "You're invited to the christening of Cael Avery M. Alfonso. RSVP now and celebrate with us! 🦕";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  let version = "1";
  let updatedAt = new Date().toISOString();
  try {
    const { data } = await supabase
      .from("event_settings")
      .select("value, updated_at")
      .eq("key", "og_version")
      .maybeSingle();
    if (data?.value) version = data.value;
    if (data?.updated_at) updatedAt = new Date(data.updated_at).toISOString();
  } catch (_) {
    // fall through with defaults
  }

  const imgUrl = `${SITE_URL}/og-image.jpg?v=${encodeURIComponent(version)}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}" />
<link rel="canonical" href="${SITE_URL}/" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${SITE_URL}/" />
<meta property="og:title" content="${TITLE}" />
<meta property="og:description" content="${DESCRIPTION}" />
<meta property="og:image" content="${imgUrl}" />
<meta property="og:image:secure_url" content="${imgUrl}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Cael Avery's Christening - Dino themed celebration" />
<meta property="og:updated_time" content="${updatedAt}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${TITLE}" />
<meta name="twitter:description" content="${DESCRIPTION}" />
<meta name="twitter:image" content="${imgUrl}" />
<meta http-equiv="refresh" content="0; url=${SITE_URL}/" />
</head>
<body>
<p>Redirecting to <a href="${SITE_URL}/">${SITE_URL}</a>…</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
});
