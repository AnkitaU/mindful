/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      return [
        {
          source: "/api/:path*",
          destination: `${apiBaseUrl}/api/:path*`,
        },
      ];
    },
  };
  
  export default nextConfig;