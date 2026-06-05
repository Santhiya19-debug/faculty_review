import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap:
      "https://faculty-review-vit-vellore-dun.vercel.app/sitemap.xml",
  };
}