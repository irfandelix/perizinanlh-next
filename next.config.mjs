/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ubah jadi @sparticuz/chromium-min
    serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core'],
};

export default nextConfig;