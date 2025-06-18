/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'localhost'
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'i.pinimg.com',
        },
      ],
  }

};

export default nextConfig;
