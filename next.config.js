/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverActions: true,
    // esmExternals: 'loose', // required to make Konva & react-konva work
  },
  // webpack: (config) => {
  //   // config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
  //   return config;
  // },
};

module.exports = nextConfig;
