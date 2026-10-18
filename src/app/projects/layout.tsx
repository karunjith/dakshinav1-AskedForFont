import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://interiors-5-main.vercel.app";

export const metadata: Metadata = {
  title: "Architectural Portfolio & Selected Works",
  description: "Browse the architectural portfolio of Dakshina Architects: backwater villas, courtyard homesteads, creative studios, and modern tropical restorations in Kerala.",
  keywords: ["Architectural Portfolio Kerala", "Dakshina Projects", "Alappuzha Villa Projects", "Courtyard Home Showcase", "Kerala Architecture Photos"],
  alternates: {
    canonical: `${siteUrl}/projects`,
  },
  openGraph: {
    title: "Architectural Portfolio & Selected Works | Dakshina Architects",
    description: "Browse the architectural portfolio of Dakshina Architects: backwater villas, courtyard homesteads, creative studios, and modern tropical restorations in Kerala.",
    url: `${siteUrl}/projects`,
    siteName: "Dakshina Architects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/portfolio_dining.jpg`,
        width: 1200,
        height: 630,
        alt: "Dakshina Architects Portfolio Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Architectural Portfolio & Selected Works | Dakshina Architects",
    description: "Browse the architectural portfolio of Dakshina Architects: backwater villas, courtyard homesteads, creative studios, and modern tropical restorations in Kerala.",
    images: [`${siteUrl}/images/portfolio_dining.jpg`],
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
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
                "name": "Portfolio & Projects",
                "item": `${siteUrl}/projects`
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
