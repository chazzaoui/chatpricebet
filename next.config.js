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
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    
    // Ignore problematic modules in client-side builds
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'node-localstorage/register': false,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      };
    }
    
    // Ignore WASM files that cause issues
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
