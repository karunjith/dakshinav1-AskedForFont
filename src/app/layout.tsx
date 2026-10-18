import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import GlobalPreloader from "@/components/GlobalPreloader";
import CMSLiveListener from "@/components/CMSLiveListener";

import localFont from "next/font/local";

const manrope = localFont({
  src: "../../public/fonts/Manrope-VariableFont_wght.ttf",
  variable: "--font-sans",
  display: "swap",
});

const mirageThin = localFont({
  src: "../../public/fonts/mirage-thin.otf",
  variable: "--font-serif",
  display: "swap",
});

const mirageRegular = localFont({
  src: "../../public/fonts/mirage-personal-use-only.otf",
  variable: "--font-mirage-regular",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://interiors-5-main.vercel.app";
const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "google91e626741ad3407b";

export const metadata: Metadata = {
  title: {
    default: "Dakshina Architects | Best Architects in Kayamkulam, Alappuzha & Kerala",
    template: "%s | Dakshina Architects"
  },
  description: "Dakshina Architects is the leading architecture, civil engineering, and construction firm based in Kayamkulam, Alappuzha, Kochi & Kerala. Specializing in modern Nalukettu, luxury tropical villas, climate-responsive residential house plans, interior design, commercial infrastructure, landscape architecture, and turnkey building execution for homeowners across Kayamkulam, Alappuzha, Kerala, South India, and Global NRI clients.",
  keywords: [
    // Brand & Name Variations
    "Dakshina Architects",
    "Dakshina Architects Kayamkulam",
    "Dakshina Architects Alappuzha",
    "Dakshina Architects Kerala",
    "Dakshina Architecture Studio",
    "Dakshina Architectural Consultants",
    "Dakshina Civil Engineers",
    "Dakshina Construction Kayamkulam",
    "Dakshina Builders Alappuzha",
    "Dakshina Design Studio",
    "Dakshina Interiors",
    "Dakshina Puthiyavila Kayamkulam",

    // Hyper-Local Kayamkulam & Surrounding Regions
    "Architects in Kayamkulam",
    "Best architects in Kayamkulam",
    "Top architectural firm in Kayamkulam",
    "House designers in Kayamkulam",
    "Building contractors in Kayamkulam",
    "Civil engineers in Kayamkulam",
    "Interior designers in Kayamkulam",
    "Architects near Kayamkulam",
    "Architects in Puthiyavila",
    "Architects in Haripad",
    "Architects in Mavelikkara",
    "Architects in Karunagappally",
    "Architects in Adoor",
    "Architects in Chengannur",
    "Architects in Ochira",
    "Building designers Haripad",
    "House plans Mavelikkara",
    "Civil engineering consultancy Kayamkulam",

    // Alappuzha District Core Keywords
    "Architects in Alappuzha",
    "Best architects in Alappuzha",
    "Top 10 architects in Alappuzha",
    "Top architectural firm in Alappuzha",
    "Residential architects in Alappuzha",
    "Civil engineers in Alappuzha",
    "Building contractors Alappuzha",
    "Interior designers in Alappuzha",
    "Landscape architects Alappuzha",
    "House construction Alappuzha",
    "Vazhicherry Alappuzha architects",
    "Alleppey architecture studio",
    "Backwater villa architects Alappuzha",

    // Central & Southern Kerala Hubs
    "Architects in Kochi",
    "Architectural firm in Kochi",
    "Top architects in Ernakulam",
    "Architects in Kottayam",
    "Best architects in Kollam",
    "Architects in Pathanamthitta",
    "Architects in Thrissur",
    "Architects in Trivandrum",
    "Best architects in Kerala",
    "Top 10 architects in Kerala",
    "Top architecture firms in Kerala",
    "Famous architects in Kerala",
    "Leading residential architects in Kerala",

    // Regional & South India
    "Architects in South India",
    "Tropical architecture firms South India",
    "Architects in Tamil Nadu",
    "Architects in Bangalore Karnataka",
    "Coastal architecture consultants South India",

    // NRI Home Building & Construction
    "NRI home construction Kerala",
    "NRI house design Kerala",
    "NRI villa architects Kerala",
    "NRI luxury home builders Kerala",
    "Turnkey villa construction Kerala for NRIs",
    "Turnkey home construction Kayamkulam",
    "Remote house construction monitoring Kerala",
    "Independent luxury house architects Kerala",

    // Traditional & Tropical Architectural Styles
    "Modern Nalukettu house design",
    "Traditional Kerala architecture modern",
    "Kerala traditional Nalukettu plans",
    "Modern Kerala house plans and elevations",
    "Minimalist tropical architecture Kerala",
    "Climate responsive architecture Kerala",
    "Eco friendly house architects Kerala",
    "Courtyard house architecture Kerala",
    "Waterfront villa design Kerala",
    "Sustainable architecture Kerala",
    "Kerala heritage home renovation",
    "Traditional Nalukettu restoration Kerala",
    "Thatchu Shastra modern architecture Kerala",
    "Vastu compliant house plans Kerala",

    // Civil Engineering, Structural & Building Permits
    "Civil engineering consultancy Kerala",
    "Structural design consultants Kerala",
    "Panchayat building permit plans Kerala",
    "Municipality building sanction drawings Kerala",
    "3D house elevation designers Kerala",
    "3D architectural visualization Kerala",
    "Building estimation and BOQ Kerala",
    "Residential construction contractors Kerala",
    "Commercial building contractors Kerala",
    "Turnkey building contractors Alappuzha",

    // Interior Architecture & Custom Joinery
    "Interior design firm Kochi",
    "Luxury interior design Kerala",
    "Teak wood interior curation Kerala",
    "Traditional wooden woodwork Kerala homes",
    "Modern minimalist interior designers Kerala",
    "Modular kitchen designers Kayamkulam Alappuzha",
    "Living room spatial design Kerala",

    // Landscaping & Master Planning
    "Landscape architects Alappuzha",
    "Landscape architecture Kerala",
    "Tropical garden designers Kerala",
    "Plot division and master planning Kerala",
    "Site contour and land planning consultants Kerala",
    "Rainwater harvesting landscape design Kerala"
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: gscVerification,
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Kayamkulam, Alappuzha, Kerala, India",
    "geo.position": "9.1726;76.5013",
    "ICBM": "9.1726, 76.5013",
    "target-audience": "Homeowners, Real Estate Developers, Commercial Builders, NRI Property Investors",
    "coverage": "Kayamkulam, Alappuzha, Kochi, Kerala, South India, Global NRI Clients",
    "distribution": "Global",
    "rating": "General"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Dakshina Architects | Top Architects in Kayamkulam, Alappuzha & Kerala",
    description: "Premier architectural design, civil engineering, luxury tropical villas, interior curation, and turnkey construction in Kayamkulam, Alappuzha, Kochi, and all across Kerala.",
    url: siteUrl,
    siteName: "Dakshina Architects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/hero_interior.jpg`,
        width: 1200,
        height: 630,
        alt: "Dakshina Architects Modern Tropical Courtyard Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dakshina Architects | Top Architects in Kayamkulam, Alappuzha & Kerala",
    description: "Premier architectural design, civil engineering, luxury tropical villas, and interior curation in Kayamkulam, Alappuzha, Kochi, and all across Kerala.",
    images: [`${siteUrl}/images/hero_interior.jpg`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#23281E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`preloader-active ${manrope.variable} ${mirageThin.variable} ${mirageRegular.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        {/* Synchronous scroll lock & manual restoration: Prevents flash of old scrolled position */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                window.scrollTo(0, 0);
              } catch (e) {}
              setTimeout(function() {
                try {
                  document.documentElement.classList.remove('preloader-active');
                  var b = document.getElementById('preloader-barrier');
                  if (b) { b.style.display = 'none'; }
                } catch(e) {}
              }, 1200);
            `,
          }}
        />
        {/* Zero-latency initial screen shield to guarantee 0% FOUC before React mounts */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.preloader-active, html.preloader-active body {
                overflow: hidden !important;
                touch-action: none !important;
              }
              #preloader-barrier {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background-color: #23281E !important;
                z-index: 9999999 !important;
              }
              html:not(.preloader-active) #preloader-barrier {
                display: none !important;
                pointer-events: none !important;
                opacity: 0 !important;
              }
            `,
          }}
        />
      </head>
      <body className={`${manrope.variable} ${mirageThin.variable} ${mirageRegular.variable} ${cormorant.variable} antialiased min-h-screen flex flex-col bg-background text-foreground relative`}>
        {/* Microsoft Clarity Analytics Script */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xucxpzrzb9");
            `,
          }}
        />

        <GlobalPreloader />
        <SmoothScroll>
          <Header />
          <div className="grow fade-enter-active">
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
          </div>
          <Footer />
        </SmoothScroll>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Dakshina Architects",
                "url": siteUrl,
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `${siteUrl}/projects?query={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": ["LocalBusiness", "Architect", "ProfessionalService"],
                "name": "Dakshina Architects",
                "alternateName": [
                  "Dakshina Architects Kayamkulam",
                  "Dakshina Architectural Studio & Civil Engineering",
                  "Dakshina Design Studio Alappuzha"
                ],
                "image": `${siteUrl}/images/hero_interior.jpg`,
                "@id": `${siteUrl}/#architect`,
                "url": siteUrl,
                "telephone": "+918848666041",
                "email": "dakshinaarchitects@gmail.com",
                "priceRange": "$$$",
                "description": "Leading architecture studio, civil engineering consultancy, and turnkey building firm based in Kayamkulam, Alappuzha & Kerala. Designing modern Nalukettu, luxury tropical residences, sustainable waterfront villas, interior spatial curation, and master land planning.",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Puthiyavila, Kayamkulam",
                  "addressLocality": "Kayamkulam",
                  "addressRegion": "Kerala",
                  "postalCode": "690531",
                  "addressCountry": "IN"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 9.1726,
                  "longitude": 76.5013
                },
                "hasMap": "https://share.google/R7mY5iWK2OtYp9XFy",
                "areaServed": [
                  { "@type": "City", "name": "Kayamkulam" },
                  { "@type": "City", "name": "Alappuzha" },
                  { "@type": "City", "name": "Haripad" },
                  { "@type": "City", "name": "Mavelikkara" },
                  { "@type": "City", "name": "Karunagappally" },
                  { "@type": "City", "name": "Adoor" },
                  { "@type": "City", "name": "Chengannur" },
                  { "@type": "City", "name": "Kochi" },
                  { "@type": "City", "name": "Ernakulam" },
                  { "@type": "City", "name": "Kottayam" },
                  { "@type": "City", "name": "Kollam" },
                  { "@type": "AdministrativeArea", "name": "Kerala" },
                  { "@type": "Country", "name": "India" },
                  { "@type": "AdministrativeArea", "name": "South India" }
                ],
                "serviceArea": "Kayamkulam, Alappuzha, Kerala, South India, and Global NRI clients seeking home builds in Kerala",
                "openingHoursSpecification": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                  ],
                  "opens": "09:00",
                  "closes": "18:00"
                },
                "sameAs": [
                  "https://share.google/R7mY5iWK2OtYp9XFy",
                  "https://www.instagram.com/dakshina_architects"
                ]
              }
            ])
          }}
        />

        {/* Global Floating Action Buttons */}
        <FloatingContact />
        <CMSLiveListener />
      </body>
    </html>
  );
}
