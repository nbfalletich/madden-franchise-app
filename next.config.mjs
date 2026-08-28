/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Mock imagery is served from picsum.photos (deterministic seeded photos).
    // When you wire in real assets, add their host here.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
