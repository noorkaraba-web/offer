/**
 * Local fonts for next/og's ImageResponse, bundled as static assets via
 * Next.js's `fetch(new URL('./file', import.meta.url))` convention so no
 * network fetch happens at render time — this is what actually fixes the
 * "Failed to load dynamic font" error: without an explicit `fonts` array,
 * ImageResponse tries to resolve fonts for non-Latin glyphs (Korean plate
 * characters, Arabic/Cyrillic share-card text) from a remote font service,
 * which 400s when that service is unreachable.
 *
 * NotoSansKR.ttf is the full, unsubset variable font (~10MB) — there's no
 * `fonttools`/`pyftsubset` available in the sandbox that produced this to
 * cut it down to just the ~50 Hangul syllables Korean plates actually use.
 * Works correctly as-is; subsetting it is a worthwhile follow-up once real
 * dev tooling is available (smaller edge function bundle, faster cold start).
 */

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  style: "normal";
}

export const OG_FONT_FAMILY = "Noto Sans, Noto Sans Arabic, Noto Sans KR";

let cached: OgFont[] | null = null;
let loading: Promise<OgFont[]> | null = null;

export function loadOgFonts(): Promise<OgFont[]> {
  if (cached) return Promise.resolve(cached);
  if (loading) return loading;

  loading = (async () => {
    const [latin, arabic, korean] = await Promise.all([
      fetch(new URL("../assets/fonts/NotoSans.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL("../assets/fonts/NotoSansArabic.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL("../assets/fonts/NotoSansKR.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
    ]);

    cached = [
      { name: "Noto Sans", data: latin, style: "normal" },
      { name: "Noto Sans Arabic", data: arabic, style: "normal" },
      { name: "Noto Sans KR", data: korean, style: "normal" },
    ];
    return cached;
  })();

  return loading;
}
