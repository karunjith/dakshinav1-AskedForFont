"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState<string>("/uploads/da12-1785438293653.webp");
  const [companyName, setCompanyName] = useState<string>("DAKSHINA ARCHITECTS");
  const [phone, setPhone] = useState<string>("+91 5696523652");
  const [email, setEmail] = useState<string>("dakshinaarchitects@gmail.com");
  const [address, setAddress] = useState<string>("310B Junction, Vazhicherry Ward, Alappuzha, Kerala - 688001");
  const [mapsUrl, setMapsUrl] = useState<string>("https://share.google/QaStKz2hYxyXAL90j");
  const [logoError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const hydrateLocal = () => {
      try {
        const cached = localStorage.getItem("dakshina_cms_settings");
        if (cached) {
          const settings = JSON.parse(cached);
          if (settings.logo) setLogoUrl(settings.logo);
          if (settings.companyName) setCompanyName(settings.companyName);
          if (settings.phone) setPhone(settings.phone);
          if (settings.email) setEmail(settings.email);
          if (settings.address) setAddress(settings.address);
          if (settings.googleMapsEmbedUrl || settings.mapsUrl) setMapsUrl(settings.googleMapsEmbedUrl || settings.mapsUrl);
        }
        const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
        if (cachedContent) {
          const coords = JSON.parse(cachedContent)?.home?.coordinates;
          if (coords) {
            if (coords.phone) setPhone(coords.phone);
            if (coords.email) setEmail(coords.email);
            if (coords.address) setAddress(coords.address);
            if (coords.googleMapsUrl) setMapsUrl(coords.googleMapsUrl);
          }
        }
      } catch {}
    };

    // 0. Immediate LocalStorage Hydration
    hydrateLocal();

    const fetchFooterContent = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
        const serverLastSaved = Number(data.lastSaved || "0");
        const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

        if (isServerFresh) {
          const settings = data?.settings || {};
          const coords = data?.websiteContent?.home?.coordinates || data?.content?.home?.coordinates || {};

          if (settings.logo) setLogoUrl(settings.logo);
          if (settings.companyName) setCompanyName(settings.companyName);

          const currentPhone = coords.phone || settings.phone;
          if (currentPhone) setPhone(currentPhone);

          const currentEmail = coords.email || settings.email;
          if (currentEmail) setEmail(currentEmail);

          const currentAddress = coords.address || settings.address;
          if (currentAddress) setAddress(currentAddress);

          const currentMapsUrl = coords.googleMapsUrl || settings.googleMapsEmbedUrl || settings.mapsUrl;
          if (currentMapsUrl) setMapsUrl(currentMapsUrl);
        } else {
          hydrateLocal();
        }
      } catch (err) {
        console.error("Failed to load footer branding:", err);
      }
    };
    fetchFooterContent();

    const handleReload = () => {
      hydrateLocal();
      fetchFooterContent();
    };
    window.addEventListener("cms_reload_content", handleReload);
    window.addEventListener("storage", handleReload);

    return () => {
      window.removeEventListener("cms_reload_content", handleReload);
      window.removeEventListener("storage", handleReload);
    };
  }, []);

  if (pathname.startsWith("/studio")) return null;

  const cleanPhone = phone.replace(/\s+/g, "");

  return (
    <footer className="bg-[#23281E] text-[#E8DACB] pt-16 pb-12 md:pt-20 md:pb-14 border-t border-[#8C421F]/30 relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E8DACB08_1px,transparent_1px),linear-gradient(to_bottom,#E8DACB08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <div className="container max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Main Content Grid with items-start so top edges align in a single line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-14 items-start">
          
          {/* Brand Block (Left-aligned on mobile and desktop, top aligned with navigation headers) */}
          <div className="lg:col-span-4 flex flex-col items-start text-left gap-4">
            <Link href="/" className="inline-block pt-0 mt-0 leading-none">
              {logoUrl && !logoError ? (
                <div 
                  role="img"
                  aria-label={companyName}
                  style={{
                    backgroundColor: "#E8DACB",
                    WebkitMaskImage: `url(${logoUrl})`,
                    maskImage: `url(${logoUrl})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskPosition: "left top",
                    maskPosition: "left top",
                  }}
                  className="h-9 sm:h-10 md:h-14 w-28 sm:w-32 md:w-40 transition-all duration-300 filter drop-shadow-sm"
                />
              ) : (
                <div className="flex flex-col items-start leading-none">
                  <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-[#B66C48] mb-1 leading-none">
                    ARCHITECTURAL STUDIO
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#E8DACB] tracking-tight">
                    DAKSHINA
                  </h2>
                </div>
              )}
            </Link>
            <p className="text-sm text-[#E8DACB]/80 leading-relaxed font-light max-w-sm">
              Climate-responsive tropical architecture & spatial curation in Kerala. We harmonize ancestral spatial wisdom with contemporary minimalism.
            </p>
          </div>

          {/* Symmetrical 2-Column Section for Navigation + Studio HQ */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-5 grid grid-cols-[auto_1fr] gap-6 sm:gap-10 lg:gap-8 xl:gap-10 items-start">
            {/* Navigation Column */}
            <div className="flex flex-col gap-2.5 text-left shrink-0">
              <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-[#B66C48] font-bold block mb-1 leading-none">
                NAVIGATION
              </span>
              <Link href="/" className="text-xs sm:text-sm text-[#E8DACB]/80 hover:text-[#B66C48] transition-colors whitespace-nowrap">Home</Link>
              <Link href="/about" className="text-xs sm:text-sm text-[#E8DACB]/80 hover:text-[#B66C48] transition-colors whitespace-nowrap">Philosophy</Link>
              <Link href="/projects" className="text-xs sm:text-sm text-[#E8DACB]/80 hover:text-[#B66C48] transition-colors whitespace-nowrap">Portfolio</Link>
              <Link href="/services" className="text-xs sm:text-sm text-[#E8DACB]/80 hover:text-[#B66C48] transition-colors whitespace-nowrap">Expertise</Link>
              <Link href="/contact" className="text-xs sm:text-sm text-[#E8DACB]/80 hover:text-[#B66C48] transition-colors whitespace-nowrap">Contact</Link>
            </div>

            {/* Studio HQ Column */}
            <div className="flex flex-col gap-2.5 text-left min-w-0">
              <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-[#B66C48] font-bold block mb-1 leading-none">
                STUDIO HQ
              </span>
              <a 
                href={`mailto:${email}`} 
                title={email}
                className="text-[#E8DACB]/80 font-light hover:text-[#B66C48] transition-colors whitespace-nowrap text-xs sm:text-sm block"
              >
                {email}
              </a>
              <a 
                href={`tel:${cleanPhone}`} 
                className="text-[#E8DACB]/80 font-light hover:text-[#B66C48] transition-colors whitespace-nowrap text-xs sm:text-sm block"
              >
                {phone}
              </a>
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={address}
                className="text-[#E8DACB]/90 font-medium hover:text-[#B66C48] transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <span className="truncate max-w-[190px] xs:max-w-[220px] sm:max-w-xs">{address}</span>
                <ArrowUpRight size={13} className="text-[#B66C48] shrink-0" />
              </a>
            </div>
          </div>

          {/* Action CTA Block (Left-aligned on mobile and desktop) */}
          <div className="lg:col-span-3 flex flex-col gap-4 items-start text-left">
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-[#B66C48] font-bold block leading-none">
              COMMISSION INQUIRY
            </span>
            <p className="font-serif text-xl font-light text-[#E8DACB] leading-snug max-w-xs">
              Ready to draft your next space?
            </p>
            <Link
              href="/contact"
              className="bg-[#8C421F] text-[#E8DACB] px-6 py-3 font-sans text-xs tracking-widest uppercase rounded-full inline-flex items-center gap-2 hover:bg-[#B66C48] transition-all transform hover:-translate-y-0.5 shadow-md font-semibold whitespace-nowrap"
            >
              Start Project <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left border-t border-[#8C421F]/20 pt-6 gap-3 font-sans text-xs text-[#E8DACB]/70 font-medium">
          <span className="whitespace-nowrap">&copy; {new Date().getFullYear()} DAKSHINA ARCHITECTS. All rights reserved.</span>
          <div className="flex items-center gap-3 font-semibold whitespace-nowrap">
            <span>Alappuzha</span>
            <span>&middot;</span>
            <span>Kochi</span>
            <span>&middot;</span>
            <span>Kerala</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
