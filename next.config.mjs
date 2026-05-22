/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no need for experimental flag
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth profile images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub profile images (if added)
      },
    ],
  },

  // Security headers. CSP is intentionally permissive for inline styles
  // (required by Next.js streaming) but blocks third-party script origins.
  async headers() {
    // Vercel Live (preview feedback widget) and Vercel Analytics need to be
    // explicitly allow-listed when deploying on Vercel; they are no-ops
    // outside of Vercel.
    const vercelScripts = "https://vercel.live https://va.vercel-scripts.com";
    const vercelConnect =
      "https://vercel.live https://va.vercel-scripts.com https://*.pusher.com wss://*.pusher.com";
    const evalDirective = process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : '';

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      `img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://vercel.live https://vercel.com`,
      "font-src 'self' data: https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "style-src-elem 'self' 'unsafe-inline' https://vercel.live",
      // 'unsafe-inline' is required by Next.js for hydration scripts;
      // 'unsafe-eval' only enabled in development.
      `script-src 'self' 'unsafe-inline'${evalDirective} ${vercelScripts}`,
      `script-src-elem 'self' 'unsafe-inline' ${vercelScripts}`,
      `connect-src 'self' https://accounts.google.com ${vercelConnect}`,
      "frame-src 'self' https://vercel.live",
      // blob: allows playback of in-memory MediaRecorder output (Interview
      // Trainer audio captures stay client-side, never uploaded).
      "media-src 'self' blob:",
      "manifest-src 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // TypeScript and ESLint
  typescript: {
    // Don't fail build on type errors in production (handled by CI/CD)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't fail build on lint errors in production (handled by CI/CD)
    // Set to true to allow build with warnings
    ignoreDuringBuilds: true,
  },

  // Webpack configuration for bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
