"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowDown, ArrowUpRight, Quote, Phone, MapPin, Mail } from "lucide-react";
import ProjectModal from "@/components/ProjectModal";
import dynamic from "next/dynamic";

const HeroAccordion = dynamic(() => import("@/components/HeroAccordion"), {
  ssr: false,
});

const CinematicIntro = dynamic(() => import("@/components/CinematicIntro"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[500vh] sm:h-[450vh] md:h-[400vh] lg:h-[350vh] bg-[#23281E]" />
  ),
});

const ParallaxGallery = dynamic(() => import("@/components/ParallaxGallery"), {
  ssr: false,
});

const CommissionsPreview = dynamic(() => import("@/components/CommissionsPreview"), {
  ssr: false,
});

interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  image: string;
  images?: string[]; // Multiple showcase images (Requirement 6)
  year?: string;
  area?: string;
  materials?: string[];
  description?: string;
}

// Master list of best creations for the homepage carousel (Requirement 12 & 6: added multiple images)
const bestWorks: Project[] = [
  {
    id: 1,
    title: "The Backwater Pavilion",
    category: "Architecture",
    location: "Alappuzha",
    image: "/images/hero_interior.jpg",
    images: ["/images/hero_interior.jpg", "/images/portfolio_dining.jpg", "/images/portfolio_office.jpg"],
    year: "2025",
    area: "2,850 sq.ft.",
    materials: ["Reclaimed Teak", "Local Clay tiles", "Polished Granite"],
    description: "A climate-responsive lakefront residence designed along Alappuzha's coastal channels. It features floating timber decks, pitched clay roof rafters, and sliding louvers that capture lake breezes."
  },
  {
    id: 2,
    title: "Kuttanad Heritage Modern",
    category: "Interior",
    location: "Kuttanad",
    image: "/images/portfolio_dining.jpg",
    images: ["/images/portfolio_dining.jpg", "/images/portfolio_office.jpg", "/images/slider_after.jpg"],
    year: "2026",
    area: "3,100 sq.ft.",
    materials: ["Handmade clay blocks", "Breathable lime wash", "Brass joinery"],
    description: "An adaptive restoration of a heritage Kuttanad courtyard homestead. The layout incorporates elevated stone plinths to adapt to backwater tide rises and central open light wells."
  },
  {
    id: 3,
    title: "Vazhicherry Creative Studio",
    category: "Planning",
    location: "Alappuzha",
    image: "/images/portfolio_office.jpg",
    images: ["/images/portfolio_office.jpg", "/images/slider_after.jpg", "/images/hero_interior.jpg"],
    year: "2024",
    area: "1,200 sq.ft.",
    materials: ["Local teak partitions", "Polished plaster wash", "Basalt floor slabs"],
    description: "A minimalist, light-flooded workspace pavilion designed for a creative studio in Vazhicherry. Built with operable wooden screen grids to provide cross-ventilation overlooking a lily pond."
  },
  {
    id: 4,
    title: "Alleppey Canal House",
    category: "Landscaping",
    location: "Alappuzha",
    image: "/images/slider_after.jpg",
    images: ["/images/slider_after.jpg", "/images/hero_interior.jpg", "/images/portfolio_dining.jpg"],
    year: "2025",
    area: "1,950 sq.ft.",
    materials: ["Polished cement screed", "Terracotta masonry", "Oak rafters"],
    description: "A modern renovation of an urban canal-side cottage in Alappuzha. Employs brick latticework screens that buffer street humidity, filter incoming dust, and capture cooling wind flows."
  }
];

const defaultTestimonials = [
  {
    id: "testi-1",
    clientName: "Dr. Menon",
    review: "The Backwater Pavilion feels like an extension of the lagoon itself. The floating teak deck has become our family's absolute sanctuary."
  },
  {
    id: "testi-2",
    clientName: "Rekha Thomas",
    review: "Their respect for traditional Nalukettu courtyard physics transformed our old ancestral property into a breezy, modern homestead."
  },
  {
    id: "testi-3",
    clientName: "James Mathew",
    review: "A minimalist masterpiece. Every line has a purpose, from the local clay tiles to the breeze-sifting wooden grids."
  }
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [showIntroOnDevice, setShowIntroOnDevice] = useState<boolean>(true);
  
  const [settings, setSettings] = useState<Record<string, any>>({});
  
  const [carouselWorks, setCarouselWorks] = useState<Project[]>(bestWorks);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [listTestimonials, setListTestimonials] = useState<any[]>(defaultTestimonials);
  const [activeTestiIndex, setActiveTestiIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>({
    home: {
      introAnimation: {
        enabled: true,
        desktop: true,
        tablet: true,
        mobile: true
      },
      hero: {
        enabled: true,
        title1: "dakshina",
        title2: "architects",
        description: "We design climate-resilient, minimalist architecture along the coastal waters of Kerala. By harmonizing traditional courtyard physics with contemporary spatial stillness, we craft spaces that breathe with the monsoons.",
        cta: "Start Your Home Project"
      },
      philosophy: {
        enabled: true,
        title: "Designing homes with light, air, and natural materials.",
        p1: "In Kerala's tropical climate, traditional houses used central open courtyards to let fresh breeze flow through every room, keeping the home cool naturally.",
        p2: "At Dakshina Architects, we bring this traditional wisdom into modern homes. We use local clay tiles, natural wood, and lime plaster to build simple, peaceful living spaces.",
        cta: "Learn About Our Design Process"
      },
      creations: {
        enabled: true,
        title: "Our Featured Projects",
        subtitle: "OUR BEST WORK"
      },
      manifesto: {
        enabled: true,
        title: "Houses built with natural light, fresh air, and quality wood.",
        description: "Our spaces are designed to work naturally with Alappuzha's coastal wind and climate. By combining strong modern construction with traditional open courtyards, we build houses that stay comfortable all year round."
      },
      process: {
        enabled: true,
        title: "Before & After",
        subtitle: "HOW WE TRANSFORM SPACES",
        description: "Drag the slider to see how we turn raw brick and concrete into completed, beautiful living spaces."
      },
      testimonials: {
        enabled: true,
        title: "Client Testimonials",
        subtitle: "WHAT OUR CLIENTS SAY"
      },
      coordinates: {
        enabled: true,
        title: "Visit Our Design Studio.",
        subtitle: "OUR STUDIO LOCATION & ADDRESS"
      }
    }
  });

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Evaluate device-level intro animation toggle
  useEffect(() => {
    const checkWidth = () => {
      const intro = content?.home?.introAnimation as Record<string, boolean> | undefined;
      let shouldShow = true;
      if (!intro || intro.enabled === false) {
        shouldShow = false;
      } else {
        const w = window.innerWidth;
        if (w < 768) {
          shouldShow = intro.mobile !== false;
        } else if (w >= 768 && w < 1024) {
          shouldShow = intro.tablet !== false;
        } else {
          shouldShow = intro.desktop !== false;
        }
      }
      setShowIntroOnDevice(shouldShow);
      if (!shouldShow) {
        window.dispatchEvent(new CustomEvent("cinematic_disabled"));
        window.dispatchEvent(new CustomEvent("cinematic_ready"));
      }
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [content]);

  // Dynamic fetch on mount with instantaneous client-side persistence
  useEffect(() => {
    // 0. Instant LocalStorage Hydration: loads admin changes with 0ms latency
    try {
      const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
      if (cachedContent) {
        const parsed = JSON.parse(cachedContent);
        if (parsed?.home) {
          setContent(parsed);
        }
      }
      const cachedProjects = localStorage.getItem("dakshina_cms_projects");
      if (cachedProjects) {
        const parsed = JSON.parse(cachedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const featured = parsed.filter((p: Project & { featured?: boolean; status?: string }) => p.featured && p.status === "Published");
          if (featured.length > 0) setCarouselWorks(featured);
        }
      }
      const cachedSettings = localStorage.getItem("dakshina_cms_settings");
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        if (parsed && typeof parsed === "object") {
          setSettings(parsed);
        }
      }
    } catch {}

    const fetchCmsData = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
          const serverLastSaved = Number(data.lastSaved || "0");
          const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

          let hasUpdates = false;
          if (data.projects) {
            let deletedProjectIds: string[] = [];
            try {
              const d = localStorage.getItem("dakshina_cms_deleted_projects");
              if (d) deletedProjectIds = JSON.parse(d);
            } catch {}

            let localProjects: any[] = [];
            try {
              const l = localStorage.getItem("dakshina_cms_projects");
              if (l) localProjects = JSON.parse(l);
            } catch {}

            let mergedProjects = data.projects;
            if (!isServerFresh && localProjects.length > 0) {
              const localMap = new Map<string, any>();
              localProjects.forEach((p) => localMap.set(String(p.id), p));
              data.projects.forEach((p: any) => {
                if (!localMap.has(String(p.id))) localMap.set(String(p.id), p);
              });
              mergedProjects = Array.from(localMap.values());
            }

            mergedProjects = mergedProjects.filter((p: any) => !deletedProjectIds.includes(String(p.id)));

            const featured = mergedProjects.filter((p: Project & { featured?: boolean; status?: string }) => p.featured && p.status === "Published");
            if (featured.length > 0) {
              setCarouselWorks(featured);
              hasUpdates = true;
            }
            try {
              localStorage.setItem("dakshina_cms_projects", JSON.stringify(mergedProjects));
            } catch {}
          }

          if (data.testimonials && data.testimonials.length > 0) {
            setListTestimonials(data.testimonials);
            hasUpdates = true;
          }

          if (isServerFresh) {
            if (data.settings) {
              setSettings(data.settings);
              try {
                localStorage.setItem("dakshina_cms_settings", JSON.stringify(data.settings));
              } catch {}
            }
            if (data.websiteContent && data.websiteContent.home) {
              setContent(data.websiteContent);
              hasUpdates = true;
              try {
                localStorage.setItem("dakshina_cms_websiteContent", JSON.stringify(data.websiteContent));
              } catch {}
            }
          } else if (localLastSaved > 0) {
            // Auto-heal cold server container
            try {
              const localContent = localStorage.getItem("dakshina_cms_websiteContent");
              const localProj = localStorage.getItem("dakshina_cms_projects");
              const localSet = localStorage.getItem("dakshina_cms_settings");
              fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  websiteContent: localContent ? JSON.parse(localContent) : undefined,
                  projects: localProj ? JSON.parse(localProj) : undefined,
                  settings: localSet ? JSON.parse(localSet) : undefined,
                  lastSaved: localLastSaved
                })
              }).catch(() => {});
            } catch {}
          }
          
          if (hasUpdates) {
            setTimeout(() => {
              ScrollTrigger.refresh();
            }, 150);
          }
        }
      } catch (err) {
        console.error("Failed to load CMS data on home page:", err);
      }
    };
    fetchCmsData();

    window.addEventListener("cms_reload_content", fetchCmsData);
    window.addEventListener("storage", fetchCmsData);
    return () => {
      window.removeEventListener("cms_reload_content", fetchCmsData);
      window.removeEventListener("storage", fetchCmsData);
    };
  }, []);

  // 1. Initial Hero Fade reveals (Run once on page mount)
  useEffect(() => {
    if (!heroTitleRef.current || !heroDescRef.current || !heroCtaRef.current || !heroImgRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(heroTitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
        .fromTo(heroDescRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
        .fromTo(heroCtaRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
        .fromTo(heroImgRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }, "-=0.5");
    });

    return () => ctx.revert();
  }, [content]);

  // 2. Global Scroll Triggered Reveals (Re-run whenever CMS content changes)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const revealItems = document.querySelectorAll(".reveal-item");
      revealItems.forEach((item) => {
        gsap.fromTo(item,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // Testimonial quote parallax glide (only if the element exists in DOM)
      const quoteBox = document.getElementById("quote-box");
      const quoteSection = document.getElementById("quote-section");
      if (quoteBox && quoteSection) {
        gsap.fromTo(quoteBox, 
          { y: 30 },
          {
            y: -30,
            scrollTrigger: {
              trigger: quoteSection,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }
    });

    return () => {
      ctx.revert();
    };
  }, [carouselWorks]);

  // Before/After slider coordinate handler
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const onMouseDown = () => {
    const handleMouseMove = (e: MouseEvent) => handleSliderMove(e.clientX);
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
    const handleTouchMove = (evt: TouchEvent) => {
      if (evt.touches[0]) handleSliderMove(evt.touches[0].clientX);
    };
    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <>
      <main className="grow">
        {/* Scroll-driven Video Sequence Intro (Welcome screen -> frames 300) */}
        {showIntroOnDevice && (
          <CinematicIntro />
        )}

        {/* 1. Curated Hero Section with Parallax Margin Alignment */}
        {content.home.hero?.enabled && (
          <section 
            id="hero-section" 
            className="relative z-20 min-h-screen flex items-center bg-[#E8DACB] overflow-hidden pt-24 pb-16"
          >
            <div className="container grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center w-full px-4 sm:px-6 md:px-8">
              {/* Left Content Column (Balanced Mobile Editorial & Tablet/Desktop Hierarchy) */}
              <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center text-left items-start">
                {/* Distinct DESIGNING DREAMS Subtitle Banner */}
                <div className="mb-3 sm:mb-4 flex items-center">
                  <span className="inline-flex items-center gap-2 bg-[#8C421F]/10 px-3.5 py-1 rounded-full border border-[#8C421F]/20 font-sans text-[10px] sm:text-xs md:text-sm tracking-[0.28em] sm:tracking-[0.38em] uppercase text-[#8C421F] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C421F]"></span>
                    {content.home.hero.subtitle || "DESIGNING DREAMS"}
                  </span>
                </div>

                {/* Hero Title Logo */}
                <h1 className="flex mb-3 tracking-tight font-mirage-special flex-col" ref={heroTitleRef}>
                  <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#505B40] font-normal lowercase tracking-tight leading-[0.82]">
                    dakshina
                  </span>
                  <span className="block text-4xl sm:text-4xl md:text-5xl lg:text-6xl text-[#505B40] font-normal lowercase tracking-[0.08em] sm:tracking-[0.12em] leading-none mt-1 sm:-mt-2 md:-mt-4">
                    architects
                  </span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg opacity-85 leading-relaxed max-w-xl mb-6 sm:mb-8 text-charcoal font-light" ref={heroDescRef}>
                  {content.home.hero.description}
                </p>
                <Link 
                  href={content.home.hero.ctaLink || "/contact"} 
                  className="bg-[#8C421F] text-[#E8DACB] px-7 sm:px-8 py-3.5 sm:py-4 font-sans text-xs tracking-widest uppercase rounded-full flex items-center gap-2 hover:bg-[#B66C48] transition-all duration-300 transform hover:-translate-y-0.5 shadow-md font-semibold touch-manipulation active:scale-95" 
                  ref={heroCtaRef}
                >
                  {content.home.hero.cta || content.home.hero.ctaText || "Start Your Home Project"} <ArrowUpRight size={14} />
                </Link>
              </div>

              {/* Right Interactive Column (Skiper53 / HoverExpand_002 Accordion) */}
              <div className="md:col-span-5 lg:col-span-5 relative w-full rounded bg-transparent flex justify-center" ref={heroImgRef}>
                <HeroAccordion customImages={content.home.heroCollage} />
              </div>
            </div>
          </section>
        )}

        {/* 2. Philosophy Overview with Full DA BG Overlay */}
        {content.home.philosophy?.enabled && (
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-12 my-10 md:my-16">
            <section 
              id="about-section" 
              className="py-12 sm:py-16 md:py-20 text-[#E8DACB] relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#8C421F]/30 shadow-2xl"
            >
              {/* DA BG Image Background */}
              <div className="absolute inset-0 z-0">
                <Image 
                  src="/images/DA_BG.png"
                  alt="Dakshina Architectural Pattern Background"
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>

              <div className="container relative z-10 px-5 sm:px-8 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center">
                  <div className="md:col-span-5 lg:col-span-5 reveal-item flex flex-col justify-center text-left items-start">
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.25em] uppercase text-[#B66C48] mb-2 sm:mb-3 block font-bold drop-shadow-sm">
                      PHILOSOPHY
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight font-light text-[#E8DACB] drop-shadow-md">
                      {content.home.philosophy.title}
                    </h2>
                  </div>
                  <div className="md:col-span-7 lg:col-span-7 flex flex-col gap-4 sm:gap-5 text-sm sm:text-base md:text-lg leading-relaxed font-light text-[#E8DACB]/95 reveal-item drop-shadow-sm font-sans text-left">
                    <p className="leading-relaxed">{content.home.philosophy.p1}</p>
                    <p className="leading-relaxed">{content.home.philosophy.p2}</p>
                    <div className="mt-1 sm:mt-2 pt-4 sm:pt-5 border-t border-[#8C421F]/40 flex items-center justify-start">
                      <Link 
                        href="/about" 
                        className="font-sans text-xs tracking-[0.2em] uppercase text-[#E8DACB] font-bold inline-flex items-center gap-2 hover:text-[#B66C48] hover:translate-x-2 transition-all duration-300 active:scale-95 touch-manipulation drop-shadow-md"
                      >
                        Learn About Our Design Process <ArrowRight size={14} className="text-[#B66C48]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 3. FEATURED COMMISSIONS PREVIEW (Commissions Preview Showcase) */}
        {content.home.creations?.enabled && (
          <CommissionsPreview 
            projects={carouselWorks} 
            onSelectProject={openProjectDetails} 
          />
        )}

        {/* Replaced Manifesto Section (Editorial Showcase) */}
        {content.home.manifesto?.enabled && (
          <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 md:py-24 bg-forest text-[#e8dacb] relative overflow-hidden border-t border-[#8C421F]/30">
            <div className="container max-w-4xl relative z-10 px-5 sm:px-6 md:px-8">
              <span className="font-sans text-[11px] sm:text-xs tracking-[0.25em] uppercase text-[#B66C48] font-bold block mb-2 sm:mb-3">
                {content.home.manifesto.subtitle || "MANIFESTO"}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-light leading-snug sm:leading-tight mb-4 sm:mb-6 max-w-3xl">
                {content.home.manifesto.title}
              </h2>
              <p className="font-sans text-xs sm:text-sm md:text-base font-light opacity-90 max-w-2xl leading-relaxed">
                {content.home.manifesto.description}
              </p>

              {/* Architectural Dividing Motif between Manifesto and Before/After on Mobile */}
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between text-[10px] font-sans tracking-widest text-[#B66C48] uppercase font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B66C48]"></span>
                  SPACE TRANSFORMATION
                </span>
                <span className="opacity-60 font-mono">STEP 02</span>
              </div>
            </div>
          </section>
        )}

        {/* Parallax Gallery Transition Section (Desktop only - Mobile keeps single featured moving carousel) */}
        {content.home.parallaxGallery?.enabled !== false && (
          <div className="hidden md:block">
            <ParallaxGallery customImages={content.home.parallaxGallery?.images} />
          </div>
        )}

        {/* 5. Draggable Before/After Transformation Slider */}
        {content.home.process?.enabled && (
          <section id="slider-section" className="pt-8 pb-20 sm:pt-12 sm:pb-24 md:py-24 bg-forest text-background overflow-hidden relative z-20">
            <div className="container px-4 sm:px-6 md:px-8">
              <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 md:mb-16 reveal-item">
                <span className="font-sans text-[11px] sm:text-xs tracking-widest uppercase text-[#B66C48] mb-1.5 sm:mb-2 block font-bold text-center">
                  {content.home.process.subtitle}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif text-background font-normal">
                  {content.home.process.title}
                </h2>
                <p className="font-sans text-xs sm:text-sm text-background/85 font-light mt-2 sm:mt-3 leading-relaxed">
                  {content.home.process.description}
                </p>
              </div>
              
              {/* Slider frame */}
              <div 
                id="slider-box"
                className="relative w-full max-w-4xl mx-auto aspect-[4/3] md:aspect-[16/9] overflow-hidden cursor-ew-resize rounded-2xl md:rounded-3xl shadow-2xl select-none touch-pan-y reveal-item border border-[#8C421F]/20" 
                ref={sliderRef}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
              >
                {/* After state image */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <Image 
                    src={content.home.process.afterImage || "/images/slider_after.jpg"} 
                    alt="Completed clean architectural living space" 
                    fill
                    draggable={false}
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-5 right-5 font-sans text-[9px] tracking-widest uppercase px-3 py-2 bg-[#23281E]/90 text-[#E8DACB] border border-[#8C421F]/30 backdrop-blur-md rounded-full font-bold">
                    Completed Space
                  </div>
                </div>

                {/* Before state image (placed over after, clipped without squishing - Requirement 6) */}
                <div 
                  className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden" 
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                  <Image 
                    src={content.home.process.beforeImage || "/images/slider_before.jpg"} 
                    alt="Raw brick concrete construction site framework" 
                    fill
                    draggable={false}
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-5 left-5 font-sans text-[9px] tracking-widest uppercase px-3 py-2 bg-[#23281E]/90 text-[#E8DACB] border border-[#8C421F]/30 backdrop-blur-md rounded-full font-bold z-30">
                    Raw Shell
                  </div>
                </div>

                {/* Sliding line divider */}
                <div 
                  className="absolute top-0 w-0.5 h-full bg-white z-30 -translate-x-[50%] pointer-events-none" 
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-10 h-10 rounded-full bg-white border border-neutral-300/40 flex justify-between items-center px-2 shadow-lg text-charcoal">
                    <ArrowDown size={12} className="rotate-90 text-sage" />
                    <ArrowDown size={12} className="-rotate-90 text-sage" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. Client Testimonials Section (Touch-Swipe & Tablet Optimized) */}
        {content.home.testimonials?.enabled && (
          <section id="quote-section" className="py-20 md:py-32 bg-[#E8DACB] overflow-hidden">
            <div className="container">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="font-sans text-xs tracking-widest uppercase text-[#8C421F] mb-3 block font-bold">
                  {content.home.testimonials.subtitle || "CLIENT TESTIMONIALS"}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-[#23281E]">
                  {content.home.testimonials.title || "Words From Homeowners"}
                </h2>
                <div className="mt-4 flex items-center justify-center gap-2 lg:hidden">
                  <span className="font-sans text-[10px] tracking-widest uppercase text-[#8C421F]/80 font-semibold bg-[#8C421F]/10 px-3 py-1 rounded-full border border-[#8C421F]/20">
                    &larr; Swipe to read reviews &rarr;
                  </span>
                </div>
              </div>

              {/* Swipeable Carousel Container on Mobile & Tablet, Grid on Desktop */}
              <div 
                id="quote-box" 
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const scrollLeft = el.scrollLeft;
                  const width = el.offsetWidth;
                  const newIndex = Math.round(scrollLeft / (width * 0.85));
                  setActiveTestiIndex(Math.min(Math.max(newIndex, 0), listTestimonials.length - 1));
                }}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 lg:grid lg:grid-cols-3 lg:gap-8 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0"
              >
                {listTestimonials.map((t, idx) => (
                  <div 
                    key={t.id || idx} 
                    className="testi-card shrink-0 w-[88vw] sm:w-[65vw] md:w-[44vw] lg:w-auto snap-start bg-[#FDFBF7] p-7 md:p-9 rounded-3xl border border-[#8C421F]/25 flex flex-col justify-between shadow-md hover:border-[#8C421F] hover:shadow-xl transition-all duration-300 active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <Quote size={28} className="text-[#8C421F] opacity-85" />
                        <div className="flex gap-1 text-[#8C421F]">
                          {"★".repeat(t.rating || 5)}
                        </div>
                      </div>
                      <p className="font-serif text-base sm:text-lg text-[#23281E] font-normal italic leading-relaxed mb-6">
                        &ldquo;{t.review}&rdquo;
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[#8C421F]/20 flex items-center justify-between">
                      <div>
                        <h4 className="font-sans text-xs tracking-wider uppercase text-[#23281E] font-bold">{t.clientName}</h4>
                        <span className="font-sans text-[11px] text-[#8C421F] font-semibold tracking-wide">Client &bull; {t.location || "Kerala"}</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8C421F]"></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Dot Navigation */}
              <div className="flex items-center justify-center gap-2 mt-2 lg:hidden">
                {listTestimonials.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => {
                      const box = document.getElementById("quote-box");
                      if (box) {
                        const cards = box.querySelectorAll(".testi-card");
                        if (cards[dotIdx]) {
                          cards[dotIdx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                        }
                      }
                      setActiveTestiIndex(dotIdx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeTestiIndex === dotIdx ? "w-6 bg-[#8C421F]" : "w-2 bg-[#8C421F]/30 hover:bg-[#8C421F]/60"
                    }`}
                    aria-label={`Go to testimonial ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. Studio HQ Coordinates & Interactive Map (Botanical Forest Green Section) */}
        {content.home.coordinates?.enabled && (
          <section id="coordinates-section" className="py-24 md:py-36 bg-[#505B40] text-[#E8DACB] relative overflow-hidden border-t border-[#8C421F]/30 shadow-2xl">
            {/* Background Architectural Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#E8DACB05_1px,transparent_1px),linear-gradient(to_bottom,#E8DACB05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

            <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Coordinates Info */}
              <div className="lg:col-span-5 flex flex-col gap-8 reveal-item">
                <div>
                  <span className="font-sans text-xs tracking-widest uppercase text-[#B66C48] mb-3 block font-semibold">
                    {content.home.coordinates.subtitle || "HQ COORDINATES"}
                  </span>
                  <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight text-[#E8DACB]">
                    {content.home.coordinates.title || "Visit the Studio."}
                  </h2>
                </div>
                
                <div className="flex flex-col gap-6 font-sans text-sm text-[#E8DACB]/85 font-light">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8C421F]/20 rounded-xl text-[#B66C48] shrink-0 border border-[#8C421F]/30">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#E8DACB] mb-1">Physical Studio HQ</h4>
                      <p>{content.home?.coordinates?.address || settings?.address || "310B Junction, Vazhicherry Ward, Alappuzha, Kerala – 688001"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8C421F]/20 rounded-xl text-[#B66C48] shrink-0 border border-[#8C421F]/30">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#E8DACB] mb-1">Direct Line</h4>
                      <p className="hover:text-[#B66C48] transition-colors">
                        <a href={`tel:${(content.home?.coordinates?.phone || settings?.phone || "+91 88486 66041").replace(/\s+/g, "")}`}>
                          {content.home?.coordinates?.phone || settings?.phone || "+91 88486 66041"}
                        </a>
                      </p>
                    </div>
                  </div>

                  {(content.home?.coordinates?.whatsapp || settings?.whatsapp) && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#25D366]/20 rounded-xl text-[#25D366] shrink-0 border border-[#25D366]/30">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.025 1.01 11.398 1.01c-5.446 0-9.877 4.37-9.881 9.801 0 1.842.482 3.633 1.397 5.183L1.87 20.91l5.066-1.309.002-.001.001-.001zm11.516-7.537c-.303-.151-1.793-.88-2.057-.975-.264-.095-.456-.143-.647.143-.19.287-.738.928-.905 1.117-.167.188-.334.212-.637.061-.303-.151-1.28-.471-2.44-1.502-.903-.803-1.512-1.795-1.689-2.097-.177-.302-.019-.465.132-.615.136-.135.303-.352.454-.529.151-.177.202-.294.303-.49.101-.197.051-.368-.025-.519-.076-.151-.647-1.558-.887-2.133-.233-.559-.47-.482-.647-.492-.167-.008-.359-.01-.55-.01s-.501.072-.762.352c-.261.28-.996.972-.996 2.37s1.022 2.75 1.165 2.94c.143.19 2.012 3.072 4.875 4.31.681.295 1.213.47 1.627.601.684.218 1.307.187 1.8.114.55-.082 1.793-.732 2.047-1.439.254-.707.254-1.314.178-1.44-.077-.127-.264-.197-.568-.347z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-[#E8DACB] mb-1">WhatsApp Direct</h4>
                        <p className="hover:text-[#B66C48] transition-colors">
                          <a 
                            href={`https://wa.me/${(content.home?.coordinates?.whatsapp || settings?.whatsapp || "").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {content.home?.coordinates?.whatsapp || settings?.whatsapp}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#8C421F]/20 rounded-xl text-[#B66C48] shrink-0 border border-[#8C421F]/30">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#E8DACB] mb-1">Architectural Inquiries</h4>
                      <p className="hover:text-[#B66C48] transition-colors">
                        <a href={`mailto:${content.home?.coordinates?.email || settings?.email || "dakshinaarchitects@gmail.com"}`}>
                          {content.home?.coordinates?.email || settings?.email || "dakshinaarchitects@gmail.com"}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map Frame */}
              <div className="lg:col-span-7 w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-[#8C421F]/30 relative reveal-item bg-[#1A1A1A]">
                <iframe 
                  src={(content.home?.coordinates?.googleMapsUrl && content.home.coordinates.googleMapsUrl.includes("embed")) ? content.home.coordinates.googleMapsUrl : (settings?.googleMapsEmbedUrl && settings.googleMapsEmbedUrl.includes("embed")) ? settings.googleMapsEmbedUrl : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.4385966601614!2d76.32626071478952!3d9.501584293183576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0884d5dfd17887%3A0xe96c4d7ec6a6d65c!2sVazhicherry%20Ward%2C%20Alappuzha%2C%20Kerala%20688001!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true}
                  loading="lazy"
                  title="Dakshina Architects Studio Google Map"
                ></iframe>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Screen-locked case study modal dialog (Requirement 9) */}
      <ProjectModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
