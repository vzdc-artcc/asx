import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '15mb',
        },
        webpackMemoryOptimizations: true,
    },
};

export default nextConfig;
