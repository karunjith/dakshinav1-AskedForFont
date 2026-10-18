"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      const introEl = document.getElementById("intro-container");
      return introEl !== null && window.scrollY < 300;
    }
    return false;
  });
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("DAKSHINA");
  const [contactPhone, setContactPhone] = useState<string>("+91 88486 66041");
  const [contactEmail, setContactEmail] = useState<string>("dakshinaarchitects@gmail.com");

  const isStudio = pathname.startsWith("/studio");

  useEffect(() => {
    if (isStudio) return;

    const hydrateLocal = () => {
      try {
        const cached = localStorage.getItem("dakshina_cms_settings");
        if (cached) {
          const s = JSON.parse(cached);
          if (s.logo) setLogoUrl(s.logo);
          if (s.companyName) setCompanyName(s.companyName);
          if (s.phone) setContactPhone(s.phone);
          if (s.email) setContactEmail(s.email);
        }
        const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
        if (cachedContent) {
          const c = JSON.parse(cachedContent)?.home?.coordinates;
          if (c?.phone) setContactPhone(c.phone);
          if (c?.email) setContactEmail(c.email);
        }
      } catch {}
    };

    // 0. Immediate LocalStorage Hydration
    hydrateLocal();

    const fetchBranding = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
          const serverLastSaved = Number(data.lastSaved || "0");
          const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

          if (isServerFresh) {
            const settings = data.settings || {};
            const coords = data?.websiteContent?.home?.coordinates || data?.content?.home?.coordinates || {};
            if (settings.logo) setLogoUrl(settings.logo);
            if (settings.companyName) setCompanyName(settings.companyName);
            const activePhone = coords.phone || settings.phone;
            if (activePhone) setContactPhone(activePhone);
            const activeEmail = coords.email || settings.email;
            if (activeEmail) setContactEmail(activeEmail);
          } else {
            hydrateLocal();
          }
        }
      } catch (err) {
        console.error("Failed to load header logo branding:", err);
      }
    };
    fetchBranding();

    const handleReload = () => {
      hydrateLocal();
      fetchBranding();
    };
    window.addEventListener("cms_reload_content", handleReload);
    window.addEventListener("storage", handleReload);
    return () => {
      window.removeEventListener("cms_reload_content", handleReload);
      window.removeEventListener("storage", handleReload);
    };
  }, [isStudio]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMenuOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (isStudio) return;
    if (isMenuOpen) {
      document.documentElement.classList.add("lenis-stopped");
    } else {
      document.documentElement.classList.remove("lenis-stopped");
    }
    return () => document.documentElement.classList.remove("lenis-stopped");
  }, [isMenuOpen, isStudio]);

  const [logoError] = useState(false);

  useEffect(() => {
    if (isStudio) return;

    const checkIntroVisibility = () => {
      if (pathname === "/") {
        const introEl = document.getElementById("intro-container");
        if (introEl) {
          const threshold = introEl.offsetTop + introEl.offsetHeight - (window.innerHeight * 0.75);
          setIsWelcomeVisible(window.scrollY < threshold);
        } else {
          // Intro animation disabled or not present in DOM -> Show header immediately at top
          setIsWelcomeVisible(false);
        }
      } else {
        setIsWelcomeVisible(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      checkIntroVisibility();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    window.addEventListener("cms_reload_content", handleScroll);
    
    // Initial check on mount
    handleScroll();
    const t1 = setTimeout(handleScroll, 100);
    const t2 = setTimeout(handleScroll, 500);
    const t3 = setTimeout(handleScroll, 1200);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("cms_reload_content", handleScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, isStudio]);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      setIsMenuOpen(false);
    }
  };

  if (isStudio) return null;

  return (
    <header 
      suppressHydrationWarning
      className={`fixed top-0 left-0 w-full transition-all duration-500 z-[1000] flex justify-center bg-charcoal/95 backdrop-blur-md border-b border-russet/30 shadow-md ${
        isMenuOpen ? "bg-charcoal" : ""
      }`}
      style={{
        transform: isWelcomeVisible && !isMenuOpen ? "translateY(-100%)" : "translateY(0)",
        opacity: isWelcomeVisible && !isMenuOpen ? 0 : 1,
        pointerEvents: isWelcomeVisible && !isMenuOpen ? "none" : "auto",
        transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, background-color 0.5s ease"
      }}
    >
      <div 
        suppressHydrationWarning
        className={`container max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center whitespace-nowrap transition-all duration-500 ${
          isScrolled ? "py-2.5 sm:py-3" : "py-3.5 sm:py-4"
        }`}
      >
        {/* Logo / Brand Name Container */}
        <div suppressHydrationWarning className="font-serif text-base sm:text-lg md:text-xl font-bold tracking-wider transition-colors duration-300 z-[1001] shrink-0">
          <Link href="/" onClick={(e) => handleNavLinkClick(e, "/")} className="flex items-center gap-2" suppressHydrationWarning>
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
                  WebkitMaskPosition: "left center",
                  maskPosition: "left center",
                }}
                className={`transition-all duration-300 filter drop-shadow-sm ${
                  isScrolled ? "h-8 sm:h-9 md:h-12 w-24 sm:w-28 md:w-36" : "h-9 sm:h-10 md:h-14 w-28 sm:w-32 md:w-40"
                }`} 
              />
            ) : (
              <span className="font-serif font-light text-lg sm:text-xl md:text-2xl tracking-tight text-[#E8DACB]">
                DAKSHINA <span className="text-[10px] sm:text-xs font-sans tracking-widest text-[#B66C48] uppercase font-bold ml-1">ARCHITECTS</span>
              </span>
            )}
          </Link>
        </div>
      
      {/* Desktop & Tablet Navigation Links (Order: Home -> Expertise -> Portfolio -> Philosophy -> Contact Us) */}
      <nav className="hidden md:flex gap-3 lg:gap-7 items-center shrink-0" suppressHydrationWarning>
        <Link 
          href="/" 
          onClick={(e) => handleNavLinkClick(e, "/")}
          className={`font-sans text-[11px] lg:text-xs tracking-wider lg:tracking-widest uppercase transition-all duration-300 font-semibold ${
            pathname === "/" ? "text-[#B66C48] border-b-2 border-[#B66C48] pb-0.5" : "text-[#E8DACB]/90 hover:text-[#B66C48]"
          }`}
        >
          Home
        </Link>
        <Link 
          href="/services" 
          onClick={(e) => handleNavLinkClick(e, "/services")}
          className={`font-sans text-[11px] lg:text-xs tracking-wider lg:tracking-widest uppercase transition-all duration-300 font-semibold ${
            pathname === "/services" ? "text-[#B66C48] border-b-2 border-[#B66C48] pb-0.5" : "text-[#E8DACB]/90 hover:text-[#B66C48]"
          }`}
        >
          Expertise
        </Link>
        <Link 
          href="/projects" 
          onClick={(e) => handleNavLinkClick(e, "/projects")}
          className={`font-sans text-[11px] lg:text-xs tracking-wider lg:tracking-widest uppercase transition-all duration-300 font-semibold ${
            pathname === "/projects" ? "text-[#B66C48] border-b-2 border-[#B66C48] pb-0.5" : "text-[#E8DACB]/90 hover:text-[#B66C48]"
          }`}
        >
          Portfolio
        </Link>
        <Link 
          href="/about" 
          onClick={(e) => handleNavLinkClick(e, "/about")}
          className={`font-sans text-[11px] lg:text-xs tracking-wider lg:tracking-widest uppercase transition-all duration-300 font-semibold ${
            pathname === "/about" ? "text-[#B66C48] border-b-2 border-[#B66C48] pb-0.5" : "text-[#E8DACB]/90 hover:text-[#B66C48]"
          }`}
        >
          Philosophy
        </Link>
        <Link 
          href="/contact" 
          onClick={(e) => handleNavLinkClick(e, "/contact")}
          className="font-sans text-[11px] lg:text-xs tracking-wider lg:tracking-widest uppercase transition-all duration-300 font-semibold bg-[#8C421F] text-[#E8DACB] px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full hover:bg-[#B66C48] shadow-sm transform hover:-translate-y-0.5"
        >
          Contact Us
        </Link>
      </nav>

      {/* Mobile toggle button (Touch optimized min 48px x 48px target) */}
      <button 
        className="md:hidden flex items-center gap-2.5 font-sans text-xs tracking-widest uppercase cursor-pointer transition-colors duration-300 z-[1001] text-[#E8DACB] hover:text-brownsugar p-3 -mr-3 touch-manipulation active:scale-95"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} className="text-[#E8DACB]" /> : (
          <>
            <span className="font-semibold">Menu</span>
            <div className="w-5 h-0.5 bg-[#E8DACB]"></div>
          </>
        )}
      </button>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[998] md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Overlay Drawer (Minimal & Professional) */}
      <div 
        className={`fixed top-0 right-0 w-full sm:w-[85vw] md:w-[45vw] h-screen h-[100dvh] bg-[#23281E] border-l border-[#8C421F]/25 z-[999] flex flex-col justify-between p-8 sm:p-12 overflow-y-auto transition-transform duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top Minimal Studio Heading */}
        <div className="pt-10 sm:pt-12 pb-4 border-b border-[#8C421F]/20 flex items-center justify-between">
          <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-[#B66C48] font-bold">
            DAKSHINA ARCHITECTS
          </span>
          <span className="text-[10px] font-sans tracking-widest text-[#E8DACB]/50 uppercase">
            KERALA
          </span>
        </div>

        {/* Clean Minimal Navigation Links */}
        <div className="flex flex-col gap-6 my-auto py-8">
          {[
            { href: "/", label: "Home", num: "01" },
            { href: "/services", label: "Expertise", num: "02" },
            { href: "/projects", label: "Portfolio", num: "03" },
            { href: "/about", label: "Philosophy", num: "04" },
            { href: "/contact", label: "Contact Us", num: "05" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavLinkClick(e, item.href)}
                className="group flex items-center justify-between py-2 transition-colors touch-manipulation active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <span className={`font-serif text-sm tracking-wider ${isActive ? "text-[#B66C48]" : "text-[#E8DACB]/40 group-hover:text-[#B66C48]"}`}>
                    {item.num}
                  </span>
                  <span className={`font-serif text-3xl sm:text-4xl font-light tracking-tight transition-colors ${
                    isActive ? "text-[#B66C48] font-normal" : "text-[#E8DACB] group-hover:text-[#B66C48]"
                  }`}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#B66C48]"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Minimal Quiet Footer */}
        <div className="flex flex-col gap-1.5 font-sans text-xs text-[#E8DACB]/70 border-t border-[#8C421F]/20 pt-6">
          <span className="font-semibold text-[#E8DACB]">Alappuzha, Kerala</span>
          <a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className="hover:text-[#B66C48] transition-colors">{contactPhone}</a>
          <a href={`mailto:${contactEmail}`} className="hover:text-[#B66C48] transition-colors">{contactEmail}</a>
        </div>
      </div>
      </div>
    </header>
  );
}
