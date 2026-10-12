/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode double-mounts effects in dev, which would load the portal scripts twice.
  reactStrictMode: false,
  async rewrites() {
    return [
      { source: '/admin', destination: '/' },
      { source: '/doctor', destination: '/' },
      { source: '/manufacturer', destination: '/' },
      { source: '/vendor', destination: '/' },
      { source: '/pharmacy', destination: '/' },
      { source: '/patient', destination: '/' },
    ];
  },
};
export default nextConfig;
