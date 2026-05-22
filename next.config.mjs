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

  // Force a single canonical host so OAuth state cookies stay on one
  // origin. Google's authorised redirect URI is the apex
  // (https://learnskillsai.com/api/auth/callback/google), so any visit
  // to the `www` variant has to land on apex before signIn runs —
  // otherwise the state cookie set on www is invisible to apex and
  // NextAuth aborts the callback with ?error=Callback.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.learnskillsai.com' }],
        destination: 'https://learnskillsai.com/:path*',
        permanent: true,
      },
    ];
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
    // Piper TTS loads its ESM bundle from jsdelivr and downloads ONNX voice
    // models from Hugging Face on first use (cached in OPFS thereafter).
    // 'wasm-unsafe-eval' lets the Piper WASM runtime execute; the worker
    // and blob: media entries cover the audio worker + decoded PCM playback.
    const piperScripts = "https://cdn.jsdelivr.net 'wasm-unsafe-eval'";
    const piperConnect =
      "https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs.hf.co";

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
      `script-src 'self' 'unsafe-inline'${evalDirective} ${vercelScripts} ${piperScripts}`,
      `script-src-elem 'self' 'unsafe-inline' ${vercelScripts} https://cdn.jsdelivr.net`,
      `connect-src 'self' https://accounts.google.com ${vercelConnect} ${piperConnect}`,
      // Piper runs synthesis in a Web Worker spawned from a blob: URL.
      "worker-src 'self' blob:",
      "frame-src 'self' https://vercel.live",
      // blob: allows playback of in-memory MediaRecorder output (Interview
      // Trainer audio captures stay client-side, never uploaded) and the
      // PCM blobs Piper returns from predict().
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
