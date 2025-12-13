/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan konfigurasi ini:
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
};

export default nextConfig;