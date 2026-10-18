import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://interiors-5-main.vercel.app";

export const metadata: Metadata = {
  title: "Contact & Book Consultation",
  description: "Start your build project with Dakshina Architects in Alappuzha, Kerala. Inquire for plot feasibility, villa design, or home renovation consultation.",
  keywords: ["Contact Dakshina Architects", "Architect Consultation Alappuzha", "Hire Architect Kerala", "Architect Phone Number Alappuzha"],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact & Book Consultation | Dakshina Architects",
    description: "Start your build project with Dakshina Architects in Alappuzha, Kerala. Inquire for plot feasibility, villa design, or home renovation consultation.",
    url: `${siteUrl}/contact`,
    siteName: "Dakshina Architects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/hero_interior.jpg`,
        width: 1200,
        height: 630,
        alt: "Contact Dakshina Architects Design Studio Alappuzha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact & Book Consultation | Dakshina Architects",
    description: "Start your build project with Dakshina Architects in Alappuzha, Kerala. Inquire for plot feasibility, villa design, or home renovation consultation.",
    images: [`${siteUrl}/images/hero_interior.jpg`],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
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
                "name": "Contact Us",
                "item": `${siteUrl}/contact`
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
