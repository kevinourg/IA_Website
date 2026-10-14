import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Robots de la plateforme : les pages privées ou transactionnelles ne sont pas indexées. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/apercu/",
        "/espace/",
        "/commander/",
        "/admin",
        "/dev/",
        "/api/",
        "/desinscription/",
      ],
    },
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
