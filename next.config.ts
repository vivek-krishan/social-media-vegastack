import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/woodzcraft/posts/**", // Adjust pathname as needed
      },
      // Add other domains if needed
    ],
    domains: ["ik.imagekit.io"], // Alternative approach (deprecated but still works)
  },
};

export default nextConfig;
