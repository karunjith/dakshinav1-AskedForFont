"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { MapPin, ArrowUpRight, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import ProjectModal, { Project } from "@/components/ProjectModal";

const masterProjects: Project[] = [
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
    description: "A climate-responsive lakefront residence designed along Alappuzha's coastal channels. Features floating timber decks, pitched clay roof rafters, and sliding louvers that capture lake breezes while shielding monsoon rainfall."
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
    description: "An adaptive interior restoration of a heritage Kuttanad courtyard homestead. The layout incorporates elevated stone plinths to adapt to tide rises, central open light wells for air circulation, and solid teak joinery."
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
    description: "A master-planned, light-flooded workspace pavilion designed for a creative studio in Vazhicherry. Built with operable wooden screen grids to provide cross-ventilation overlooking a lily pond."
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
    description: "A biophilic landscape and architectural renovation of an urban canal-side cottage in Alappuzha. Employs brick latticework screens that buffer street humidity, filter incoming dust, and capture cooling wind flows."
  },
  {
    id: 5,
    title: "Vembanad Lake Retreat",
    category: "Architecture",
    location: "Kumarakom",
    image: "/images/hero_interior.jpg",
    images: ["/images/hero_interior.jpg", "/images/portfolio_office.jpg"],
    year: "2025",
    area: "3,400 sq.ft.",
    materials: ["Laterite Stone Plinths", "Louvered Teak", "Cane Ceilings"],
    description: "A private waterfront retreat oriented strictly toward the monsoon winds of Lake Vembanad. Integrates deep shaded verandahs and traditional timber joinery with contemporary low-energy living."
  },
  {
    id: 6,
    title: "Marari Courtyard Homestead",
    category: "Interior",
    location: "Mararikulam",
    image: "/images/portfolio_dining.jpg",
    images: ["/images/portfolio_dining.jpg", "/images/slider_after.jpg"],
    year: "2024",
    area: "2,200 sq.ft.",
    materials: ["Oxide Floor Screed", "Coconut Wood Beams", "Natural Jute"],
    description: "A peaceful coastal residence designed around a sunken open-air central courtyard. Breathable lime-washed walls and custom wood cabinetry create a serene coastal aesthetic."
  },
  {
    id: 7,
    title: "Punnamada Water Pavilion",
    category: "Architecture",
    location: "Alappuzha",
    image: "/images/slider_after.jpg",
    images: ["/images/slider_after.jpg", "/images/hero_interior.jpg"],
    year: "2026",
    area: "4,100 sq.ft.",
    materials: ["Reclaimed Country Brick", "Clay Rafters", "Glass Screens"],
    description: "An iconic modern home overlooking the Punnamada backwaters. Floating cantilevered roofs shade the floor-to-ceiling glass openings, shielding direct tropical solar heat while capturing river reflections."
  },
  {
    id: 8,
    title: "Pathiramanal Tropical Gardens",
    category: "Landscaping",
    location: "Muhamma",
    image: "/images/portfolio_office.jpg",
    images: ["/images/portfolio_office.jpg", "/images/portfolio_dining.jpg"],
    year: "2025",
    area: "5,800 sq.ft.",
    materials: ["Granite Stepping Slabs", "Porous Terracotta", "Rain Channels"],
    description: "Landscape master plan incorporating rainwater retention swales, indigenous backwater flora, and sunken sitting decks that harmoniously merge garden habitats with coastal architecture."
  },
  {
    id: 9,
    title: "Alappuzha Heritage Guildhall",
    category: "Planning",
    location: "Alappuzha",
    image: "/images/hero_interior.jpg",
    images: ["/images/hero_interior.jpg", "/images/slider_after.jpg"],
    year: "2024",
    area: "2,600 sq.ft.",
    materials: ["Heritage Timber", "Exposed Masonry", "Brass Hardware"],
    description: "Urban master plan and adaptive reuse strategy for a historic trading warehouse in the canal quarter. Transformed into an artisan workspace with natural sky-lit corridors."
  }
];

const ITEMS_PER_PAGE = 12; // Exactly 4 clean, prominent rows of 3 columns (12 projects per page)

function ProjectsList() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allProjects, setAllProjects] = useState<Project[]>(masterProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeFilter = selectedFilter !== null 
    ? selectedFilter 
    : (categoryParam ? categoryParam.toLowerCase() : "all");

  const filteredProjects = activeFilter === "all"
    ? allProjects
    : allProjects.filter(p => p.category.toLowerCase() === activeFilter.toLowerCase());

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Load live projects with instantaneous client-side persistence
  useEffect(() => {
    // 0. Instant LocalStorage Hydration: loads admin changes with 0ms latency
    try {
      const cached = localStorage.getItem("dakshina_cms_projects");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const visible = (parsed as Project[]).filter((p) => p.status !== "Draft");
          if (visible.length > 0) setAllProjects(visible);
        }
      }
    } catch {}

    const loadLiveContent = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.projects && Array.isArray(data.projects)) {
          const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
          const serverLastSaved = Number(data.lastSaved || "0");
          const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

          let deletedProjectIds: string[] = [];
          try {
            const d = localStorage.getItem("dakshina_cms_deleted_projects");
            if (d) deletedProjectIds = JSON.parse(d);
          } catch {}

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
          const visible = mergedProjects.filter((p) => p.status !== "Draft");
          setAllProjects(visible.length > 0 ? visible : masterProjects);
          try {
            localStorage.setItem("dakshina_cms_projects", JSON.stringify(mergedProjects));
          } catch {}

          if (!isServerFresh && localLastSaved > 0) {
            try {
              fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projects: mergedProjects, lastSaved: localLastSaved })
              }).catch(() => {});
            } catch {}
          }
        }
      } catch (err) {
        console.error("Error loading live CMS content:", err);
      }
    };
    loadLiveContent();

    window.addEventListener("cms_reload_content", loadLiveContent);
    window.addEventListener("storage", loadLiveContent);
    return () => {
      window.removeEventListener("cms_reload_content", loadLiveContent);
      window.removeEventListener("storage", loadLiveContent);
    };
  }, []);

  // Initial page load reveals
  useEffect(() => {
    const sub = document.getElementById("projects-subtitle");
    const title = document.getElementById("projects-title");
    const filters = document.querySelectorAll("#projects-filters button");
    if (!sub || !title) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(sub, 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 }
      ).fromTo(title, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.3"
      );

      if (filters.length > 0) {
        tl.fromTo(filters, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          "-=0.4"
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Filter change resets to page 1 and animates grid smoothly
  const handleFilterChange = (category: string) => {
    if (category === activeFilter) return;

    gsap.to(".project-card-item", {
      opacity: 0,
      y: 12,
      duration: 0.25,
      stagger: 0.03,
      ease: "power2.in",
      onComplete: () => {
        setSelectedFilter(category);
        setCurrentPage(1);
      }
    });
  };

  // Page switcher scroll & animation
  const handlePageChange = (newPage: number) => {
    if (newPage === safePage || newPage < 1 || newPage > totalPages) return;

    gsap.to(".project-card-item", {
      opacity: 0,
      y: 12,
      duration: 0.2,
      stagger: 0.02,
      ease: "power2.in",
      onComplete: () => {
        setCurrentPage(newPage);
        const gridElem = document.getElementById("portfolio-grid-anchor");
        if (gridElem) {
          gridElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  };

  useEffect(() => {
    gsap.fromTo(".project-card-item",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }
    );
  }, [activeFilter, safePage]);

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <>
      <main className="pt-32 sm:pt-36 bg-[#E8DACB] min-h-screen pb-24 text-[#2C2623]">
        {/* 1. Page Header */}
        <section className="pb-8 mb-8 md:mb-10 border-b border-[#8C421F]/20 container max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
          <span id="projects-subtitle" className="font-sans text-xs tracking-[0.25em] uppercase text-[#8C421F] mb-2.5 block font-bold text-center sm:text-left">
            CURATED COMMISSIONS
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-center sm:text-left">
            <h1 id="projects-title" className="text-3xl sm:text-4xl md:text-6xl font-serif font-light leading-none tracking-tight text-[#2C2623]">
              Selected Portfolio.
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#2C2623]/80 font-light max-w-md mx-auto sm:mx-0">
              A curated catalog of tropical residences, climate-responsive interiors, and landscape architectures across Kerala.
            </p>
          </div>
        </section>

        {/* 2. Filter Bar (Horizontal Touch Swipe Bar with Counts for Mobile & Tablet) */}
        <section className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
          <div id="projects-filters" className="flex items-center gap-2 mb-8 md:mb-12 overflow-x-auto no-scrollbar py-2 px-1 flex-nowrap touch-pan-x scroll-smooth">
            {[
              { id: "all", label: "All Disciplines" },
              { id: "architecture", label: "Architecture" },
              { id: "interior", label: "Interior" },
              { id: "planning", label: "Planning" },
              { id: "landscaping", label: "Landscaping" }
            ].map((cat) => {
              const count = cat.id === "all" 
                ? allProjects.length 
                : allProjects.filter(p => p.category.toLowerCase() === cat.id).length;
              const isSelected = activeFilter === cat.id;

              return (
                <button 
                  key={cat.id}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 font-sans text-xs tracking-wider uppercase cursor-pointer rounded-full transition-all duration-300 shrink-0 touch-manipulation active:scale-95 flex items-center gap-2 border ${
                    isSelected 
                      ? "bg-[#8C421F] text-[#E8DACB] border-[#8C421F] shadow-md font-bold" 
                      : "bg-[#FDFBF7] text-[#2C2623] border-[#8C421F]/20 hover:border-[#8C421F] hover:bg-[#8C421F]/10 font-medium"
                  }`}
                  onClick={() => handleFilterChange(cat.id)}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${
                    isSelected ? "bg-white/25 text-[#E8DACB]" : "bg-[#23281E]/10 text-[#8C421F]"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div id="portfolio-grid-anchor" className="scroll-mt-32"></div>

          {/* 3. Original Clean & Architectural Portfolio Grid (Mobile-First Cards & Tablet 2-Col Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-10 mb-16">
            {paginatedProjects.map((project) => (
              <div 
                key={project.id} 
                className="project-card-item flex flex-col gap-3.5 cursor-pointer group active:scale-[0.99] transition-all duration-300 bg-[#FDFBF7] sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none border border-[#8C421F]/20 sm:border-0 shadow-md sm:shadow-none"
                onClick={() => openProjectDetails(project)}
              >
                {/* Visual Image Container with Subtle Radius and Architectural Border */}
                <div className="relative w-full aspect-[16/11] overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900/10 shadow-sm border border-[#8C421F]/20 group-hover:border-[#8C421F] transition-all duration-300">
                  <Image 
                    src={project.image} 
                    alt={project.title} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10">
                    <span className="bg-[#23281E]/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 font-sans text-[10px] tracking-widest text-[#E8DACB] uppercase font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B66C48]"></span>
                      <span>{project.category}</span>
                    </span>
                  </div>

                  {/* Year Tag */}
                  <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10">
                    <span className="bg-[#E8DACB]/90 backdrop-blur-md px-2.5 py-1 rounded-full font-sans text-[10px] tracking-wider text-[#2C2623] font-bold shadow-sm border border-[#8C421F]/20">
                      {project.year || "2025"}
                    </span>
                  </div>

                  {/* Elegant Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="font-sans text-[10px] tracking-widest uppercase font-semibold text-white bg-[#8C421F] px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                      View Case Study <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>

                {/* Title & Category Line */}
                <div className="flex justify-between items-baseline pt-1">
                  <h3 className="font-serif text-xl sm:text-2xl text-[#2C2623] font-normal group-hover:text-[#8C421F] transition-colors leading-snug">
                    {project.title}
                  </h3>
                  <span className="font-sans text-[10px] sm:text-[11px] tracking-widest uppercase text-[#8C421F] font-bold shrink-0 ml-2">
                    {project.category}
                  </span>
                </div>

                {/* Location, Area & Description */}
                <div className="flex flex-col gap-1.5">
                  <p className="font-sans text-xs text-[#2C2623]/75 font-light flex items-center gap-2">
                    <MapPin size={13} className="text-[#8C421F] shrink-0" />
                    <span className="font-medium text-[#2C2623]">{project.location}</span>
                    {project.area && (
                      <>
                        <span className="text-[#8C421F]">&bull;</span>
                        <span>{project.area}</span>
                      </>
                    )}
                  </p>
                  {project.description && (
                    <p className="font-sans text-xs text-[#2C2623]/75 font-light line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Mobile 'Tap to explore' link for unmistakable UX */}
                <div className="flex sm:hidden items-center justify-between pt-2 border-t border-[#8C421F]/15 mt-1 text-[11px] font-sans tracking-wider text-[#8C421F] font-semibold uppercase">
                  <span>Explore Case Study</span>
                  <ArrowUpRight size={13} />
                </div>
              </div>
            ))}
          </div>

          {/* 4. Page Switcher & Navigation Controls (Under Grid - Mobile Centered) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-[#8C421F]/20">
            {/* Range Counter */}
            <span className="font-sans text-xs text-[#2C2623]/75 font-light text-center sm:text-left">
              Showing <strong className="font-semibold text-[#8C421F]">{startIndex + 1}</strong> to <strong className="font-semibold text-[#8C421F]">{Math.min(startIndex + ITEMS_PER_PAGE, filteredProjects.length)}</strong> of <strong className="font-semibold text-[#2C2623]">{filteredProjects.length}</strong> commissions
            </span>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className="min-h-[40px] px-4 py-2 rounded-full border border-[#8C421F]/30 bg-[#FDFBF7] text-xs font-sans uppercase tracking-wider font-semibold text-[#2C2623] hover:border-[#8C421F] hover:bg-[#8C421F]/10 disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all touch-manipulation active:scale-95 cursor-pointer shadow-xs"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] h-10 rounded-full text-xs font-sans font-semibold transition-all touch-manipulation active:scale-95 cursor-pointer flex items-center justify-center ${
                        safePage === pageNum
                          ? "bg-[#8C421F] text-[#E8DACB] shadow-md font-bold"
                          : "bg-[#FDFBF7] text-[#2C2623] border border-[#8C421F]/20 hover:border-[#8C421F] hover:bg-[#8C421F]/10"
                      }`}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="min-h-[40px] px-4 py-2 rounded-full border border-[#8C421F]/30 bg-[#FDFBF7] text-xs font-sans uppercase tracking-wider font-semibold text-[#2C2623] hover:border-[#8C421F] hover:bg-[#8C421F]/10 disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all touch-manipulation active:scale-95 cursor-pointer shadow-xs"
                  aria-label="Next Page"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default function Projects() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-36 flex items-center justify-center bg-[#E8DACB]">
        <span className="font-sans text-xs uppercase tracking-widest text-[#8C421F] font-semibold animate-pulse">Loading Portfolio...</span>
      </div>
    }>
      <ProjectsList />
    </Suspense>
  );
}
