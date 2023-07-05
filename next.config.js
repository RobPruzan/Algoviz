/** @type {import('next').NextConfig} */
const isTauriBuild = process.env.IS_TAURI_BUILD;

const nextConfig =
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

module.exports = nextConfig;
