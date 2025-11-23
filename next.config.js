/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      'node-localstorage/register': false,
    };
    
    // Ignore node-localstorage in client-side builds
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'node-localstorage/register': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
