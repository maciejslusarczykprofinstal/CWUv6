/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Vercel na buildzie podaje VERCEL_GIT_COMMIT_SHA
    NEXT_PUBLIC_COMMIT_SHA:
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.NEXT_PUBLIC_COMMIT_SHA ||
      'dev'
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
  },
};

export default nextConfig;
