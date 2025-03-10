const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v0.blob.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cryptologos.cc",
        pathname: "/**",
      },
    ],
  },
  // Add trailing slash to help with routing
  trailingSlash: true,
}

module.exports = nextConfig

