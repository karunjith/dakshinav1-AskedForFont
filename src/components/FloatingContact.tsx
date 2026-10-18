"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { trackExternalClick } from "@/lib/analytics";

export default function FloatingContact() {
  const [isVisible, setIsVisible] = useState(false);
  const [phone, setPhone] = useState<string>("+91 5696523652");
  const [whatsapp, setWhatsapp] = useState<string>("+91 8459632536");
  const pathname = usePathname();

  useEffect(() => {
    const hydrateLocal = () => {
      try {
        const cachedSettings = localStorage.getItem("dakshina_cms_settings");
        if (cachedSettings) {
          const s = JSON.parse(cachedSettings);
          if (s.phone) setPhone(s.phone);
          if (s.whatsapp) setWhatsapp(s.whatsapp);
        }
        const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
        if (cachedContent) {
          const c = JSON.parse(cachedContent)?.home?.coordinates;
          if (c?.phone) setPhone(c.phone);
          if (c?.whatsapp) setWhatsapp(c.whatsapp);
        }
      } catch {}
    };

    // 0. Immediate LocalStorage Hydration: zero latency persistence
    hydrateLocal();

    const fetchContactDetails = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
          const serverLastSaved = Number(data.lastSaved || "0");
          const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

          if (isServerFresh) {
            const coords = data?.websiteContent?.home?.coordinates || data?.content?.home?.coordinates || {};
            const settings = data?.settings || {};

            const p = coords.phone || settings.phone;
            const w = coords.whatsapp || settings.whatsapp;
            if (p) setPhone(p);
            if (w) setWhatsapp(w);
          } else {
            hydrateLocal();
          }
        }
      } catch (err) {
        console.error("Failed to load floating contact settings:", err);
      }
    };

    fetchContactDetails();

    const handleReload = () => {
      hydrateLocal();
      fetchContactDetails();
    };
    window.addEventListener("cms_reload_content", handleReload);
    window.addEventListener("cms_content_changed", handleReload);
    window.addEventListener("storage", handleReload);

    return () => {
      window.removeEventListener("cms_reload_content", handleReload);
      window.removeEventListener("cms_content_changed", handleReload);
      window.removeEventListener("storage", handleReload);
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/studio")) return;
    const handleScroll = () => {
      // Toggle visibility: hide on welcome animation sequence, show only after scroll animation ends
      if (pathname === "/") {
        const introEl = document.getElementById("intro-container");
        if (introEl) {
          const introBottom = introEl.offsetTop + introEl.offsetHeight - (window.innerHeight * 0.25);
          setIsVisible(window.scrollY >= introBottom);
        } else {
          // If scroll animation is disabled or absent, show after a tiny initial scroll
          setIsVisible(window.scrollY > 40);
        }
      } else {
        // Show permanently on secondary pages (Philosophy, Portfolio, etc.)
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  if (pathname.startsWith("/studio")) return null;

  const cleanPhone = phone.replace(/\s+/g, "");
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");

  return (
    <div 
      style={{
        bottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))",
        right: "max(1.5rem, env(safe-area-inset-right, 1.5rem))"
      }}
      className={`fixed z-[1900] flex flex-col gap-3 select-none transition-all duration-500 transform ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-90 pointer-events-none"
      }`}
    >
      {/* WhatsApp Chat Link */}
      <a 
        href={`https://wa.me/${cleanWhatsapp || "918459632536"}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={() => trackExternalClick("whatsapp", cleanWhatsapp || "+918459632536")}
        className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group relative"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 animate-ping"></span>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current relative z-10">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.025 1.01 11.398 1.01c-5.446 0-9.877 4.37-9.881 9.801 0 1.842.482 3.633 1.397 5.183L1.87 20.91l5.066-1.309.002-.001.001-.001zm11.516-7.537c-.303-.151-1.793-.88-2.057-.975-.264-.095-.456-.143-.647.143-.19.287-.738.928-.905 1.117-.167.188-.334.212-.637.061-.303-.151-1.28-.471-2.44-1.502-.903-.803-1.512-1.795-1.689-2.097-.177-.302-.019-.465.132-.615.136-.135.303-.352.454-.529.151-.177.202-.294.303-.49.101-.197.051-.368-.025-.519-.076-.151-.647-1.558-.887-2.133-.233-.559-.47-.482-.647-.492-.167-.008-.359-.01-.55-.01s-.501.072-.762.352c-.261.28-.996.972-.996 2.37s1.022 2.75 1.165 2.94c.143.19 2.012 3.072 4.875 4.31.681.295 1.213.47 1.627.601.684.218 1.307.187 1.8.114.55-.082 1.793-.732 2.047-1.439.254-.707.254-1.314.178-1.44-.077-.127-.264-.197-.568-.347z"/>
        </svg>
        <span className="absolute right-14 bg-charcoal text-white font-sans text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
          WhatsApp
        </span>
      </a>
      
      {/* Direct Telephone Link */}
      <a 
        href={`tel:${cleanPhone || "+915696523652"}`} 
        onClick={() => trackExternalClick("phone", cleanPhone || "+915696523652")}
        className="w-12 h-12 rounded-full bg-[#8C421F] hover:bg-[#B66C48] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group relative"
        aria-label="Call Phone Line"
      >
        <span className="absolute inset-0 rounded-full bg-[#8C421F] opacity-25 animate-ping"></span>
        <Phone size={16} className="relative z-10" />
        <span className="absolute right-14 bg-charcoal text-white font-sans text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
          Call Phone
        </span>
      </a>
    </div>
  );
}
