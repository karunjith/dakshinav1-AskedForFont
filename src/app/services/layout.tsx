import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://interiors-5-main.vercel.app";

export const metadata: Metadata = {
  title: "Architectural & Interior Design Services",
  description: "Explore architectural services by Dakshina Architects: Villa Design, Modern Nalukettu & Heritage Renovation, Custom Teak Joinery Interiors, and Courtyard Landscape Curation across Kerala.",
  keywords: ["Architectural Services Kerala", "House Design Alappuzha", "Interior Design Kochi", "Nalukettu Renovation", "Land Planning Kerala", "Garden Courtyard Design"],
  alternates: {
    canonical: `${siteUrl}/services`,
  },
  openGraph: {
    title: "Architectural & Interior Design Services | Dakshina Architects",
    description: "Explore architectural services by Dakshina Architects: Villa Design, Modern Nalukettu & Heritage Renovation, Custom Teak Joinery Interiors, and Courtyard Landscape Curation across Kerala.",
    url: `${siteUrl}/services`,
    siteName: "Dakshina Architects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/expertise_card_bg.jpg`,
        width: 1200,
        height: 630,
        alt: "Dakshina Architects Architectural Services & Offerings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Architectural & Interior Design Services | Dakshina Architects",
    description: "Explore architectural services by Dakshina Architects: Villa Design, Modern Nalukettu & Heritage Renovation, Custom Teak Joinery Interiors, and Courtyard Landscape Curation across Kerala.",
    images: [`${siteUrl}/images/expertise_card_bg.jpg`],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
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
                "name": "Services & Expertise",
                "item": `${siteUrl}/services`
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
