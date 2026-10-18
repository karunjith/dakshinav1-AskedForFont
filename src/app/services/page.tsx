"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight, ArrowDown, CheckCircle2, X, MapPin, Calendar, Layers, ExternalLink } from "lucide-react";
import ProjectModal, { Project } from "@/components/ProjectModal";

const defaultProjects: Project[] = [
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
    description: "A lakefront house along Alappuzha's coastal channels with floating wooden decks, clay roof tiles, and open wooden screens that catch natural breezes."
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
    description: "Interior design of a traditional Kerala courtyard house with raised stone floors, open light wells, and custom teak wood cabinets."
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
    description: "Master plan layout for a light-flooded creative office pavilion in Vazhicherry with wooden screen walls looking over a water lily pond."
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
    description: "Garden and courtyard landscaping for a canal-side home in Alappuzha featuring brick screens, tropical plants, and rainwater channels."
  }
];

export default function Services() {
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<number>(0);
  const [previewCategory, setPreviewCategory] = useState<string | null>(null);
  const [selectedProjectModal, setSelectedProjectModal] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>(defaultProjects);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cmsContent, setCmsContent] = useState<Record<string, any>>({});

  useEffect(() => {
    const hydrateLocal = () => {
      try {
        const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
        if (cachedContent) {
          const parsed = JSON.parse(cachedContent);
          if (parsed) setCmsContent(parsed);
        }
        let deletedProjectIds: string[] = [];
        try {
          const d = localStorage.getItem("dakshina_cms_deleted_projects");
          if (d) deletedProjectIds = JSON.parse(d);
        } catch {}

        const cachedProjects = localStorage.getItem("dakshina_cms_projects");
        if (cachedProjects) {
          const parsed = JSON.parse(cachedProjects);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllProjects(parsed.filter((p: Project) => !deletedProjectIds.includes(String(p.id))));
          }
        }
      } catch {}
    };

    // 0. Immediate LocalStorage Hydration
    hydrateLocal();

    const fetchCmsData = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
          const serverLastSaved = Number(data.lastSaved || "0");
          const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

          let deletedProjectIds: string[] = [];
          try {
            const d = localStorage.getItem("dakshina_cms_deleted_projects");
            if (d) deletedProjectIds = JSON.parse(d);
          } catch {}

          if (data.projects && Array.isArray(data.projects)) {
            let localProjects: Project[] = [];
            try {
              const l = localStorage.getItem("dakshina_cms_projects");
              if (l) localProjects = JSON.parse(l);
            } catch {}

            let mergedProjects = data.projects as Project[];
            if (!isServerFresh && localProjects.length > 0) {
              const map = new Map<string, Project>();
              localProjects.forEach((p) => map.set(String(p.id), p));
              data.projects.forEach((p: Project) => {
                if (!map.has(String(p.id))) map.set(String(p.id), p);
              });
              mergedProjects = Array.from(map.values());
            }

            mergedProjects = mergedProjects.filter((p) => !deletedProjectIds.includes(String(p.id)));
            setAllProjects(mergedProjects);
            try {
              localStorage.setItem("dakshina_cms_projects", JSON.stringify(mergedProjects));
            } catch {}
          }

          if (isServerFresh) {
            if (data.websiteContent) {
              setCmsContent(data.websiteContent);
              try {
                localStorage.setItem("dakshina_cms_websiteContent", JSON.stringify(data.websiteContent));
              } catch {}
            }
          } else if (localLastSaved > 0) {
            hydrateLocal();
            try {
              const localContent = localStorage.getItem("dakshina_cms_websiteContent");
              const localProj = localStorage.getItem("dakshina_cms_projects");
              fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  websiteContent: localContent ? JSON.parse(localContent) : undefined,
                  projects: localProj ? JSON.parse(localProj) : undefined,
                  lastSaved: localLastSaved
                })
              }).catch(() => {});
            } catch {}
          }
        }
      } catch (err) {
        console.error("Failed to load CMS data on services page:", err);
      }
    };
    fetchCmsData();

    const handleReload = () => {
      hydrateLocal();
      fetchCmsData();
    };
    window.addEventListener("cms_reload_content", handleReload);
    window.addEventListener("storage", handleReload);
    return () => {
      window.removeEventListener("cms_reload_content", handleReload);
      window.removeEventListener("storage", handleReload);
    };
  }, []);

  // Lock background scroll when preview modal is open
  useEffect(() => {
    if (previewCategory) {
      document.documentElement.classList.add("lenis-stopped");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.documentElement.classList.remove("lenis-stopped");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [previewCategory]);

  const scrollToCardCenter = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const targetCenter = window.scrollY + rect.top + (rect.height / 2) - (window.innerHeight / 2);
    window.scrollTo({
      top: Math.max(0, targetCenter),
      behavior: "smooth"
    });
    window.history.pushState(null, "", `#${id}`);
  };

  useEffect(() => {
    const tag = document.getElementById("monograph-tag");
    const title = document.getElementById("monograph-title");
    const subtitle = document.getElementById("monograph-subtitle");
    const spreads = document.querySelectorAll(".monograph-spread");
    if (!tag || !title) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(tag, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(title, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");
      
      if (subtitle) {
        tl.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
      }
      if (spreads.length > 0) {
        tl.fromTo(spreads, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.2 }, "-=0.4");
      }
    });
    return () => ctx.revert();
  }, []);

  const workflowPhases = [
    {
      num: "01",
      code: "STEP 01",
      title: "Site Visit & Land Planning",
      subtitle: "Orientation, Climate & Contour Analysis",
      desc: "We visit your land to check sun direction, wind flow, slope, and surroundings. We plan how to position the house for maximum comfort, thermal coolness, and fresh air.",
      duration: "Weeks 1 - 3",
      deliverables: [
        "Comprehensive site contour & soil drainage evaluation",
        "Sun-path, monsoon wind vector & shadow diagramming",
        "Initial zoning, setback verification & municipal guideline check"
      ]
    },
    {
      num: "02",
      code: "STEP 02",
      title: "Building Design & 3D Plans",
      subtitle: "Schematics, Elevation & Virtual Walkthroughs",
      desc: "We create easy-to-understand floor plans and realistic 3D house designs. You can see how every room, courtyard, and window will look before building begins.",
      duration: "Weeks 4 - 8",
      deliverables: [
        "Architectural floor plans, cross-sections & elevations",
        "High-definition 3D exterior renderings & courtyard views",
        "Kerala Panchayat / Municipal building permit sanction blueprints"
      ]
    },
    {
      num: "03",
      code: "STEP 03",
      title: "Choosing Quality Materials",
      subtitle: "Sustainable Sourcing & Detailed Specifications",
      desc: "We select authentic, durable materials suited for coastal Kerala: seasoned teak wood, natural clay roof tiles, breathable lime plaster, and solid granite stone.",
      duration: "Weeks 9 - 12",
      deliverables: [
        "Comprehensive Bill of Quantities (BOQ) & cost estimate schedules",
        "Physical material samples: terracotta, teak joinery & lime wash",
        "Complete structural, plumbing, and electrical schematic drawings"
      ]
    },
    {
      num: "04",
      code: "STEP 04",
      title: "Construction & Site Supervision",
      subtitle: "On-Site Quality Assurance & Artisanal Execution",
      desc: "Our architects conduct regular site visits across Kerala to guide masons and carpenters, ensuring every detail is built precisely to the approved drawings.",
      duration: "Active Build Phase",
      deliverables: [
        "Periodic architect milestone site inspections & quality audits",
        "Direct guidance for carpenters, masons, and specialized artisans",
        "Final detailing review and comprehensive occupancy handover"
      ]
    }
  ];

  const pillars = [
    {
      id: "architecture",
      num: "01",
      tag: "BUILDING & HOUSE DESIGN",
      title: "Architecture Design",
      description: "We design modern, climate-friendly houses across Kerala. Our designs use open courtyards, high roofs, and natural wind flow to keep your home cool in summer and protected during monsoon rains.",
      image: "/images/parallax_facade.jpg",
      scope: [
        "Independent Houses & Villas",
        "Commercial Offices & Resorts",
        "Natural Airflow & Sun Planning",
        "Building Sanction Blueprints",
        "Full 3D House Models",
        "Regular Site Construction Checks"
      ],
      highlight: "Designed to stay cool naturally with fresh air movement and shaded verandas."
    },
    {
      id: "interior",
      num: "02",
      tag: "INTERIOR DESIGN & FURNISHING",
      title: "Interior Design",
      description: "We design beautiful interiors that match your building's architecture. Using natural wood, clay tiles, lime plaster, and warm lighting, we create comfortable, peaceful living spaces.",
      image: "/images/portfolio_dining.jpg",
      scope: [
        "Custom Woodwork & Kitchen Cabinets",
        "Material & Color Selection",
        "Room Layout & Furniture Setup",
        "Lighting & Electrical Wiring Plans",
        "Custom Doors, Windows & Railings",
        "Complete Interior Finishing"
      ],
      highlight: "Crafted with quality teak wood, clay tiles, and warm ambient lighting."
    },
    {
      id: "planning",
      num: "03",
      tag: "LAND & PLOT MASTER PLANNING",
      title: "Land & Site Planning",
      description: "We help you plan larger plots of land intelligently. We analyze ground levels, soil drainage, and natural water flow to create smart layouts that protect existing trees and maximize space.",
      image: "/images/parallax_courtyard.jpg",
      scope: [
        "Plot Division & Land Layouts",
        "Slope & Water Flow Planning",
        "Preserving Existing Trees & Greenery",
        "Road & Gate Access Planning",
        "Rainwater Drainage Layouts",
        "Complete Property Master Plans"
      ],
      highlight: "Protecting natural rainwater pathways and existing greenery during site planning."
    },
    {
      id: "landscaping",
      num: "04",
      tag: "GARDEN & COURTYARD DESIGN",
      title: "Landscape Architecture",
      description: "We design outdoor gardens, inner courtyards, lotus ponds, and paved walkways that connect your home directly to nature. We use native Kerala plants that grow easily and stay green.",
      image: "/images/parallax_verandah.jpg",
      scope: [
        "Inner Open Courtyards",
        "Native Kerala Plant Selection",
        "Water Features & Lotus Ponds",
        "Rainwater Collection Pools",
        "Stone Paving & Walkways",
        "Garden & Outdoor Lighting"
      ],
      highlight: "Creating inner courtyards and pools that naturally cool down your house."
    }
  ];

  // Filter projects for Quick Preview modal
  const previewProjectsList = previewCategory 
    ? allProjects.filter(p => p.category.toLowerCase() === previewCategory.toLowerCase())
    : [];

  return (
    <main className="bg-[#E8DACB] text-[#2C2623] min-h-screen pt-36 md:pt-44 pb-24 overflow-x-hidden selection:bg-[#8C421F] selection:text-[#E8DACB]">
      
      {/* 1. Header (Centered Vertically Between Top Nav & 1st Card) */}
      {cmsContent?.services?.hero?.enabled !== false && (
        <header className="container max-w-6xl mx-auto px-6 md:px-12 mb-12 md:mb-16">
          <div className="border-b border-[#8C421F]/20 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
              <div className="lg:col-span-7">
                <div id="monograph-tag" className="font-sans text-xs tracking-[0.2em] uppercase text-[#8C421F] font-bold mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8C421F]"></span>
                  <span>{cmsContent?.services?.hero?.subtitle || "DAKSHINA ARCHITECTS • SERVICES & EXPERTISE"}</span>
                </div>
                <h1 id="monograph-title" className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-[#2C2623] tracking-tight leading-[1.05]">
                  {cmsContent?.services?.hero?.title || "Services We Offer For Your Project."}
                </h1>
              </div>

              <div className="lg:col-span-5">
                <p id="monograph-subtitle" className="font-sans text-base sm:text-lg md:text-xl text-[#2C2623]/90 font-light leading-relaxed">
                  {cmsContent?.services?.hero?.description || "We design comfortable, climate-friendly houses and buildings across Kerala using natural light, fresh breeze, and quality local materials."}
                </p>
              </div>
            </div>

          {/* Quick Jump Navigation Bar - Responsive Horizontal Snap Bar on Mobile, Balanced Grid on Desktop */}
          <nav className="flex overflow-x-auto no-scrollbar py-2 sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2.5 font-sans text-xs uppercase tracking-wider font-semibold touch-pan-x -mx-2 px-2 sm:mx-0 sm:px-0">
            <a 
              href="#architecture" 
              onClick={(e) => scrollToCardCenter(e, "architecture")}
              className="shrink-0 whitespace-nowrap px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-[#FDFBF7] border border-[#8C421F]/25 text-[#2C2623] hover:bg-[#8C421F] hover:text-[#E8DACB] transition-all shadow-xs flex items-center justify-between gap-3 group touch-manipulation active:scale-95 cursor-pointer"
            >
              <span>01 &bull; ARCHITECTURE</span>
              <ArrowDown size={14} className="text-[#8C421F] group-hover:text-[#E8DACB] group-hover:translate-y-0.5 transition-all" />
            </a>
            <a 
              href="#interior" 
              onClick={(e) => scrollToCardCenter(e, "interior")}
              className="shrink-0 whitespace-nowrap px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-[#FDFBF7] border border-[#8C421F]/25 text-[#2C2623] hover:bg-[#8C421F] hover:text-[#E8DACB] transition-all shadow-xs flex items-center justify-between gap-3 group touch-manipulation active:scale-95 cursor-pointer"
            >
              <span>02 &bull; INTERIOR DESIGN</span>
              <ArrowDown size={14} className="text-[#8C421F] group-hover:text-[#E8DACB] group-hover:translate-y-0.5 transition-all" />
            </a>
            <a 
              href="#planning" 
              onClick={(e) => scrollToCardCenter(e, "planning")}
              className="shrink-0 whitespace-nowrap px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-[#FDFBF7] border border-[#8C421F]/25 text-[#2C2623] hover:bg-[#8C421F] hover:text-[#E8DACB] transition-all shadow-xs flex items-center justify-between gap-3 group touch-manipulation active:scale-95 cursor-pointer"
            >
              <span>03 &bull; PLANNING</span>
              <ArrowDown size={14} className="text-[#8C421F] group-hover:text-[#E8DACB] group-hover:translate-y-0.5 transition-all" />
            </a>
            <a 
              href="#landscaping" 
              onClick={(e) => scrollToCardCenter(e, "landscaping")}
              className="shrink-0 whitespace-nowrap px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-[#FDFBF7] border border-[#8C421F]/25 text-[#2C2623] hover:bg-[#8C421F] hover:text-[#E8DACB] transition-all shadow-xs flex items-center justify-between gap-3 group touch-manipulation active:scale-95 cursor-pointer"
            >
              <span>04 &bull; LANDSCAPING</span>
              <ArrowDown size={14} className="text-[#8C421F] group-hover:text-[#E8DACB] group-hover:translate-y-0.5 transition-all" />
            </a>
          </nav>
        </div>
      </header>
      )}

      {/* 2. Services Feature Cards */}
      <section className="container max-w-6xl mx-auto px-6 md:px-12 mb-28 md:mb-36 flex flex-col gap-24 md:gap-32">
        {pillars.map((item, idx) => {
          const isEven = idx % 2 === 1;

          // Theme color matrix for all 4 types of work cards (Forest Green bg-[#505B40])
          const cardThemes = [
            { bg: "bg-[#505B40]", text: "text-[#e8dacb]", accent: "text-[#B66C48]", badge: "bg-[#8C421F] text-white", border: "border-[#505B40]/50" },
            { bg: "bg-[#505B40]", text: "text-[#e8dacb]", accent: "text-[#B66C48]", badge: "bg-[#B66C48] text-white", border: "border-[#505B40]/50" },
            { bg: "bg-[#505B40]", text: "text-[#e8dacb]", accent: "text-[#B66C48]", badge: "bg-[#23281E] text-white", border: "border-[#505B40]/50" },
            { bg: "bg-[#505B40]", text: "text-[#e8dacb]", accent: "text-[#B66C48]", badge: "bg-[#8C421F] text-white", border: "border-[#505B40]/50" },
          ];
          const theme = cardThemes[idx % cardThemes.length];

          return (
            <article 
              key={item.id}
              id={item.id} 
              className={`monograph-spread scroll-mt-28 rounded-3xl p-5 sm:p-8 md:p-14 border ${theme.border} shadow-2xl relative overflow-hidden ${theme.bg} ${theme.text}`}
            >
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                
                {/* Visual Frame (Clicking image opens Quick Preview automatically) */}
                <div 
                  className={`lg:col-span-6 relative cursor-pointer group active:scale-[0.98] transition-transform ${isEven ? "lg:order-2" : "lg:order-1"}`}
                  onClick={() => setPreviewCategory(item.id)}
                  title="Click to view sample projects"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                    <div className="absolute top-4 left-4 bg-[#23281E]/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 font-sans text-xs tracking-widest text-[#E8DACB] uppercase font-bold flex items-center gap-2 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-[#B66C48] animate-ping"></span>
                      <span>TAP TO PREVIEW PROJECTS &rarr;</span>
                    </div>
                  </div>
                </div>

                {/* Content Panel */}
                <div className={`lg:col-span-6 flex flex-col gap-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                  {/* Numbering & Category Tag Aligned */}
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-4xl sm:text-5xl font-extrabold text-[#e8dacb] leading-none">{item.num}</span>
                    <span className={`${theme.badge} font-bold border border-white/20 px-4 py-1.5 rounded-full shadow-xs text-xs tracking-widest uppercase`}>
                      {item.tag}
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#e8dacb] leading-tight">
                    {item.title}
                  </h2>

                  <p className="font-sans text-sm md:text-base text-[#e8dacb]/90 font-light leading-relaxed">
                    {item.description}
                  </p>

                  {/* Scope Checklist */}
                  <div className="pt-4 border-t border-white/20">
                    <span className={`font-sans text-xs tracking-widest uppercase ${theme.accent} font-bold block mb-3`}>
                      WHAT WE INCLUDE
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
                      {item.scope.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 font-sans text-xs text-[#e8dacb] font-medium">
                          <CheckCircle2 size={15} className={`${theme.accent} shrink-0`} />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dual Action Buttons (Mobile-friendly full-width touch targets) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      onClick={() => setPreviewCategory(item.id)}
                      className="bg-[#B66C48] text-white px-5 py-3 rounded-full font-sans text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:bg-[#8C421F] active:scale-95 transition-all cursor-pointer shadow-md touch-manipulation"
                    >
                      <Layers size={15} /> Quick Preview Projects
                    </button>

                    <Link
                      href={`/projects?category=${item.id}`}
                      className="bg-black/30 text-[#e8dacb] border border-white/30 px-5 py-3 rounded-full font-sans text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:bg-black/50 active:scale-95 transition-all shadow-md touch-manipulation"
                    >
                      Open Portfolio Page <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>

              </div>
            </article>
          );
        })}
      </section>

      {/* 3. Redesigned Contained Interactive Workflow Suite: How We Work With You */}
      <section className="container max-w-6xl mx-auto px-6 md:px-12 mb-28 md:mb-36">
        <div className="bg-[#FDFBF7] rounded-3xl p-6 sm:p-10 md:p-12 border border-[#8C421F]/25 shadow-xl">
          {/* Symmetrical Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-8 border-b border-[#8C421F]/15">
            <div className="max-w-xl">
              <span className="font-sans text-xs tracking-[0.25em] uppercase text-[#8C421F] font-bold mb-2.5 block flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8C421F]"></span>
                OUR STEP-BY-STEP WORKFLOW
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#2C2623] tracking-tight">
                How We Work With You
              </h2>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#2C2623]/80 font-light max-w-md leading-relaxed">
              A transparent 4-stage architectural journey ensuring your project is completed on schedule, with complete clarity, and within your dedicated vision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Interactive Stage Selector Tabs (Balanced Height & Spacing) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3">
              {workflowPhases.map((phase, idx) => {
                const isActive = activeWorkflowStage === idx;
                return (
                  <button 
                    key={phase.num}
                    type="button"
                    onClick={() => setActiveWorkflowStage(idx)}
                    className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col gap-1.5 touch-manipulation active:scale-[0.99] ${
                      isActive 
                        ? "bg-[#8C421F] text-[#E8DACB] border-[#8C421F] shadow-md ring-2 ring-[#8C421F]/20" 
                        : "bg-[#E8DACB]/30 text-[#2C2623] border-[#8C421F]/20 hover:border-[#8C421F] hover:bg-[#8C421F]/10"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-serif text-base sm:text-lg font-normal leading-snug">
                        {phase.num}. {phase.title}
                      </span>
                      <span className={`text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        isActive ? "bg-white/20 text-[#E8DACB]" : "bg-[#8C421F]/15 text-[#8C421F]"
                      }`}>
                        {phase.code}
                      </span>
                    </div>
                    <span className={`text-xs font-light line-clamp-1 ${isActive ? "text-[#E8DACB]/90" : "text-[#2C2623]/70"}`}>
                      {phase.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Stage Details Panel */}
            <div className="lg:col-span-7 bg-[#23281E] text-[#E8DACB] rounded-2xl p-6 sm:p-8 border border-[#8C421F]/30 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between border-b border-[#8C421F]/25 pb-3.5 mb-5">
                  <span className="font-sans text-xs tracking-widest text-[#8C421F] font-bold uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8C421F]"></span>
                    STAGE {activeWorkflowStage + 1} OF 4 &bull; {workflowPhases[activeWorkflowStage].code}
                  </span>
                  <span className="font-sans text-xs font-bold text-white bg-[#8C421F] px-3.5 py-1 rounded-full shadow-sm">
                    {workflowPhases[activeWorkflowStage].duration}
                  </span>
                </div>

                <h3 className="font-serif text-2xl md:text-3xl font-normal text-white mb-3">
                  {workflowPhases[activeWorkflowStage].title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#E8DACB]/80 font-light leading-relaxed mb-6">
                  {workflowPhases[activeWorkflowStage].desc}
                </p>

                <div className="space-y-3 font-sans text-xs sm:text-sm text-[#E8DACB]/90 font-light mb-8 pt-4 border-t border-[#8C421F]/20">
                  <span className="text-[10px] font-sans tracking-widest uppercase text-[#8C421F] font-bold block mb-2">
                    KEY MILESTONES & DELIVERABLES:
                  </span>
                  {workflowPhases[activeWorkflowStage].deliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-[#8C421F] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-[#8C421F]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-sans text-xs text-[#E8DACB]/70 font-light text-center sm:text-left">
                  Ready to start Stage {activeWorkflowStage + 1} for your plot?
                </span>
                <Link
                  href="/contact"
                  className="bg-[#8C421F] text-white px-6 py-3 rounded-full font-sans text-xs tracking-widest uppercase font-semibold flex items-center gap-2 hover:bg-[#B66C48] transition-all shadow-md shrink-0 active:scale-95"
                >
                  Book Plot Consultation <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact CTA */}
      <section className="container max-w-6xl mx-auto px-6 md:px-12">
        <div className="bg-[#3C453C] text-[#E8DACB] rounded-3xl p-10 md:p-16 border border-[#8C421F]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="font-sans text-xs tracking-widest uppercase text-[#B66C48] font-bold block mb-3">
              START YOUR PROJECT WITH US
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#E8DACB] mb-4">
              Ready to build your new home?
            </h2>
            <p className="font-sans text-sm md:text-base text-[#E8DACB]/80 font-light">
              Contact our design studio in Alappuzha to discuss your land plans, home design, or commercial project.
            </p>
          </div>

          <Link
            href="/contact"
            className="bg-[#8C421F] text-[#FDFBF7] px-8 py-4 font-sans text-xs tracking-widest uppercase rounded-full inline-flex items-center gap-3 hover:bg-[#B66C48] transition-all transform hover:-translate-y-1 shadow-lg font-semibold shrink-0"
          >
            Contact Our Studio <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* IN-PAGE QUICK PREVIEW MODAL (Vertically centered, Z-index 2000 above top-nav, no scrollbar) */}
      {previewCategory && (
        <div 
          className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-fade-in overscroll-contain select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewCategory(null);
            }
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div 
            data-lenis-prevent="true"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", overscrollBehavior: "contain", touchAction: "pan-y" }}
            className="bg-[#FDFBF7] text-[#23281E] rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[88vh] overflow-y-auto no-scrollbar scrollbar-none p-5 sm:p-8 md:p-10 border border-[#8C421F]/30 shadow-2xl relative cursor-default my-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#8C421F]/20 mb-8 sticky top-0 bg-[#FDFBF7] z-20 pt-2">
              <div>
                <span className="font-sans text-xs tracking-widest uppercase text-[#8C421F] font-bold block">
                  QUICK PREVIEW &bull; {previewCategory.toUpperCase()} PROJECTS
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#23281E]">
                  Sample {previewCategory.charAt(0).toUpperCase() + previewCategory.slice(1)} Projects
                </h3>
              </div>

              <button
                onClick={() => setPreviewCategory(null)}
                className="w-10 h-10 rounded-full bg-[#8C421F]/10 flex items-center justify-center text-[#8C421F] hover:bg-[#8C421F] hover:text-white transition-colors cursor-pointer touch-manipulation active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Redesigned Architectural Project Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {previewProjectsList.map((proj) => (
                <div 
                  key={proj.id} 
                  className="border border-[#8C421F]/30 rounded-2xl overflow-hidden bg-[#FDFBF7] p-4 flex flex-col justify-between gap-4 group cursor-pointer hover:border-[#8C421F] hover:shadow-xl transition-all duration-300 active:scale-[0.98] shadow-sm"
                  onClick={() => {
                    setSelectedProjectModal(proj);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 border border-[#8C421F]/15">
                      <Image 
                        src={proj.image} 
                        alt={proj.title} 
                        fill 
                        sizes="(max-width: 640px) 100vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-[#23281E]/90 text-[#E8DACB] font-sans text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full border border-white/20 shadow-xs">
                        {proj.category}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-1">
                      <h4 className="font-serif text-xl font-normal text-[#23281E] group-hover:text-[#8C421F] transition-colors leading-snug">
                        {proj.title}
                      </h4>
                      <div className="flex items-center gap-3 font-sans text-xs text-[#23281E]/75 font-medium pt-1">
                        <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#8C421F]" /> {proj.location}</span>
                        {proj.year && (
                          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#8C421F]" /> {proj.year}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#8C421F]/15 flex items-center justify-between font-sans text-xs font-bold uppercase tracking-widest text-[#8C421F] group-hover:text-[#B66C48] transition-colors">
                    <span>View Case Study</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer Options */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#8C421F]/20">
              <button
                onClick={() => setPreviewCategory(null)}
                className="font-sans text-xs uppercase tracking-widest font-semibold text-[#23281E]/70 hover:text-[#8C421F] cursor-pointer"
              >
                Close Preview & Stay On Page
              </button>

              <Link
                href={`/projects?category=${previewCategory}`}
                className="bg-[#8C421F] text-white px-6 py-3 rounded-full font-sans text-xs tracking-widest uppercase font-semibold inline-flex items-center gap-2 hover:bg-[#B66C48] transition-all shadow-md"
              >
                Open Full Portfolio Page <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Detail Case Study Modal */}
      {selectedProjectModal && (
        <ProjectModal
          project={selectedProjectModal}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

    </main>
  );
}
