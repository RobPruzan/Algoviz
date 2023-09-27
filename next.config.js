/** @type {import('next').NextConfig} */
const isTauriBuild = process.env.IS_TAURI_BUILD;

const baseNextConfig =
  isTauriBuild === 'true'
    ? {
        output: 'export',

        experimental: {
          appDir: true,
          serverActions: true,
        },
      }
    : {
        experimental: {
          appDir: true,
          serverActions: true,
        },
      };

const nextConfig = {
  ...baseNextConfig,
  images: {
    domains: ['lh3.googleusercontent.com', 'upload.wikimedia.org'],
  },
};

module.exports = nextConfig;
