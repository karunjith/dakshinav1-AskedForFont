import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://interiors-5-main.vercel.app";

export const metadata: Metadata = {
  title: "Design Philosophy & Studio Story",
  description: "Discover Dakshina Architects' design philosophy: fusing traditional Kerala courtyard layouts, climate-friendly materials, and modern minimalist architectural principles in Alappuzha & Kochi.",
  keywords: ["Dakshina Architects About", "Kerala architecture philosophy", "Courtyard house design", "Sustainable architects Kerala", "Alappuzha architectural studio"],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "Design Philosophy & Studio Story | Dakshina Architects",
    description: "Discover Dakshina Architects' design philosophy: fusing traditional Kerala courtyard physics, natural materials, and modern minimalist architectural principles.",
    url: `${siteUrl}/about`,
    siteName: "Dakshina Architects",
    locale: "en_IN",
    type: "article",
    images: [
      {
        url: `${siteUrl}/images/parallax_facade.jpg`,
        width: 1200,
        height: 630,
        alt: "Dakshina Architects Studio & Design Philosophy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Philosophy & Studio Story | Dakshina Architects",
    description: "Discover Dakshina Architects' design philosophy: fusing traditional Kerala courtyard physics, natural materials, and modern minimalist architectural principles.",
    images: [`${siteUrl}/images/parallax_facade.jpg`],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "About Studio",
                "item": `${siteUrl}/about`
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
