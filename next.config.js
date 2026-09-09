/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.carnect.biz" },
      { protocol: "https", hostname: "**.carnect.biz" },
      // Mock seed data uses picsum.photos as photo placeholders (no real
      // Carnect CDN in this environment) — see lib/data.ts and README.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

module.exports = nextConfig;
