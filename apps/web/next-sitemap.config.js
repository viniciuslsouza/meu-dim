/** @type {import("next-sitemap").IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://meudim.com.br",
  generateRobotsTxt: true,
  sitemapSize: 1000,
  changefreq: "weekly",
  priority: 1,
  exclude: [
    "/checkout*",
    "/auth/*",
    "/diagnostico",
    "/plano*",
    "/icon.svg"
  ],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }]
  }
};
