/** @type {import('next').NextConfig} */
const isTauriBuild = process.env.IS_TAURI_BUILD;

const baseNextConfig =
  isTauriBuild === 'true'
    ? {
        experimental: {
          appDir: true,
        },
        output: 'export',
      }
    : {
        experimental: {
          appDir: true,
        },
      };

const nextConfig = {
  ...baseNextConfig,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
