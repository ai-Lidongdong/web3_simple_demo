import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // 生产环境指定具体域名
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/pinata/:path*', // 前端请求的路径（如 /api/users 会被代理）
        destination: 'https://uploads.pinata.cloud/:path*', // 目标 API 地址
      },
    ];
  },
};

export default nextConfig;
