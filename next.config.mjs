/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Yerel (native) modül: bundle'a girmez, Node'dan yüklenir.
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};

export default nextConfig;
