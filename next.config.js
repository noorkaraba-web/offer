/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Real Carnect hosts, confirmed against live page dumps (see lib/carnect-source.ts):
      { protocol: "https", hostname: "carnect.biz" }, // /api/images/... (Supercar)
      { protocol: "https", hostname: "img.carnect.biz" }, // Encar photo CDN
      { protocol: "https", hostname: "heydealer-api.s3.amazonaws.com" }, // HeyDealer photos
      // Mock seed data uses picsum.photos as photo placeholders (fallback
      // when a live fetch fails) — see lib/data.ts and README.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

module.exports = nextConfig;
