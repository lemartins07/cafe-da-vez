/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Node 24.18 does not preserve stdout from Next's detached TypeScript CLI.
    useTypeScriptCli: false,
  },
  reactStrictMode: true,
  typedRoutes: true,
  webpack(config) {
    const assetRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    );

    if (assetRule) {
      assetRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
