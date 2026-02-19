const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.myshopify.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
  },
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: { root: __dirname },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ['**/node_modules', '**/.git', 'C:\\System Volume Information', 'C:\\hiberfil.sys', 'C:\\swapfile.sys'],
      };
    }
    return config;
  },
};

module.exports = nextConfig;

