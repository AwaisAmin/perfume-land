import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // DEV-ONLY: allows hotlinking the reference site's placeholder product
    // photo locally. Remove this once real product photography replaces it.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amanzadaperfumes.com",
        pathname: "/cdn/shop/**",
      },
    ],
  },
};

export default nextConfig;
