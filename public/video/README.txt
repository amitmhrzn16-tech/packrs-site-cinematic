Drop your 3 Higgsfield-generated clips here. The site auto-picks them up.

Expected filenames (any of these works — the player tries .webm first, then .mp4):
  ktm-day.webm    OR  ktm-day.mp4      ← Home + Rush  (zones 0–1)
  ktm-city.webm   OR  ktm-city.mp4     ← Services     (zone 2)
  ktm-night.webm  OR  ktm-night.mp4    ← Tracking + Success (zones 3–4)

How to extract from a Higgsfield share URL:
  1. Open the share page in Chrome/Firefox.
  2. Open DevTools (Cmd+Option+I) → Network tab → filter "media".
  3. Refresh the page so the video loads.
  4. Right-click the *.mp4 entry → "Open in new tab" → save.
  (If the share page allows it, right-click the playing video and "Save Video As…".)

Optional: convert mp4 → webm for smaller file size (~30–50% saving):
  ffmpeg -i ktm-day.mp4 -c:v libvpx-vp9 -b:v 800k -row-mt 1 -an ktm-day.webm

Recommended targets per file:
  - 1280×720 max, 6–8 second loop, < 1.5 MB each.
  - No audio (-an) — saves bytes, the site has its own audio cues.
  - Set the loop point cleanly (first and last frame should match).

The player auto-skips on data-saver / 2G / mobile (<480px) — those visitors
get the pure 3D scene without the video backplate. No fallback config needed.
