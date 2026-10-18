"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

export default function About() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>({
    about: {
      hero: {
        enabled: true,
        title: "About Our Studio",
        subtitle: "DAKSHINA ARCHITECTS",
        description: "We build thoughtful, climate-friendly homes designed around nature, comfort, and local Kerala materials."
      },
      philosophy: {
        enabled: true,
        quote: "We design homes that bring in natural light, fresh air, and peaceful green views every day.",
        p1: "Traditional houses in Kerala were built to handle heavy rain and hot sun. Builders created open inner courtyards and raised stone floors so air could move freely through every room.",
        p2: "At Dakshina Architects, we adapt this smart traditional design to modern homes. We focus on clean layouts, warm teak wood, natural clay tiles, and breathable wall finishes.",
        p3: "Your home should be your peaceful sanctuary. Our layouts make every room easy to move through, filled with light, and connected to garden greenery."
      },
      pillars: {
        enabled: true,
        title: "Our 3 Design Rules",
        subtitle: "DESIGN PRINCIPLES",
        p1Tag: "01 // NATURAL AIRFLOW",
        p1Title: "Climate & Airflow",
        p1Desc: "Block harsh direct sun and catch natural breezes. We position windows and high roofs so your house stays cool naturally without running heavy AC all day.",
        p2Tag: "02 // NATURAL MATERIALS",
        p2Title: "Local Quality Materials",
        p2Desc: "Using materials that last for generations: natural clay roof tiles, local granite stone, lime plaster wall finishes, and solid teak wood.",
        p3Tag: "03 // CLEAN LAYOUTS",
        p3Title: "Spacious & Uncluttered Rooms",
        p3Desc: "Simple, beautiful layouts with built-in storage and open spaces that make living calm, orderly, and comfortable."
      },
      masonry: {
        enabled: true,
        title: "Local Artisans & Craftsmen",
        subtitle: "LOCAL CRAFTSMANSHIP",
        p1: "Every home built by Dakshina Architects is crafted in partnership with skilled local masons, carpenters, and wood artisans across Kerala.",
        p2: "By working directly with local craftsmen, we support traditional woodworking and stone skills while ensuring your home is built with top-quality custom finish."
      }
    }
  });

  useEffect(() => {
    const hydrateLocal = () => {
      try {
        const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
        if (cachedContent) {
          const parsed = JSON.parse(cachedContent);
          if (parsed?.about) setContent(parsed);
        }
      } catch {}
    };

    // 0. Immediate LocalStorage Hydration
    hydrateLocal();

    const fetchCmsData = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.websiteContent && data.websiteContent.about) {
          const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
          const serverLastSaved = Number(data.lastSaved || "0");
          const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

          if (isServerFresh) {
            setContent(data.websiteContent);
            try {
              localStorage.setItem("dakshina_cms_websiteContent", JSON.stringify(data.websiteContent));
            } catch {}
          } else if (localLastSaved > 0) {
            hydrateLocal();
            try {
              const localContent = localStorage.getItem("dakshina_cms_websiteContent");
              if (localContent) {
                fetch("/api/content", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ websiteContent: JSON.parse(localContent), lastSaved: localLastSaved })
                }).catch(() => {});
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("Failed to load CMS data on about page:", err);
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

  useEffect(() => {
    const sub = document.getElementById("about-subtitle");
    const title = document.getElementById("about-title");
    const cols = document.getElementById("about-columns");
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

      if (cols && cols.children.length > 0) {
        tl.fromTo(cols.children, 
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" },
          "-=0.4"
        );
      }
    });

    return () => ctx.revert();
  }, [content]);

  const ab = content.about;

  return (
    <main className="pt-32 md:pt-40 pb-24 bg-[#E8DACB] text-[#2C2623] selection:bg-[#8C421F] selection:text-[#E8DACB]">
      {/* 1. Page Hero */}
      {ab.hero?.enabled && (
        <section className="pb-12 border-b border-[#8C421F]/20 mb-16 md:mb-24 container max-w-6xl mx-auto px-6 md:px-12">
          <span id="about-subtitle" className="font-sans text-xs tracking-[0.25em] uppercase text-[#8C421F] mb-3 block font-bold">
            {ab.hero.subtitle}
          </span>
          <h1 id="about-title" className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.05] tracking-tight text-[#2C2623]">
            {ab.hero.title}
          </h1>
          {ab.hero.description && (
            <p className="mt-6 text-base md:text-lg text-[#2C2623]/85 max-w-2xl leading-relaxed font-light font-sans">
              {ab.hero.description}
            </p>
          )}
        </section>
      )}

      {/* 2. Editorial Philosophy */}
      {ab.philosophy?.enabled && (
        <section className="mb-24 md:mb-32 container max-w-6xl mx-auto px-6 md:px-12">
          <div id="about-columns" className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="md:col-span-5 lg:col-span-5 font-cormorant text-2xl md:text-4xl leading-tight text-[#8C421F] font-light italic border-l-2 border-[#8C421F] pl-6 py-2">
              &ldquo;{ab.philosophy.quote}&rdquo;
            </div>
            <div className="md:col-span-7 lg:col-span-7 flex flex-col gap-6 text-base md:text-lg text-[#2C2623]/85 leading-relaxed font-light font-sans">
              {ab.philosophy.p1 && <p>{ab.philosophy.p1}</p>}
              {ab.philosophy.p2 && <p>{ab.philosophy.p2}</p>}
              {ab.philosophy.p3 && <p>{ab.philosophy.p3}</p>}
            </div>
          </div>
        </section>
      )}

      {/* 3. The 3 Design Pillars */}
      {ab.pillars?.enabled && (
        <section className="bg-[#23281E] text-[#E8DACB] py-24 mb-24 md:mb-32 border-y border-[#8C421F]/30 shadow-2xl">
          <div className="container max-w-6xl mx-auto px-6 md:px-12">
            <div className="mb-16">
              <span className="font-sans text-xs tracking-[0.25em] uppercase text-[#8C421F] mb-3 block font-bold">
                {ab.pillars.subtitle}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-[#E8DACB] font-light">
                {ab.pillars.title}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  num: "01",
                  tag: ab.pillars.p1Tag,
                  title: ab.pillars.p1Title,
                  desc: ab.pillars.p1Desc
                },
                {
                  num: "02",
                  tag: ab.pillars.p2Tag,
                  title: ab.pillars.p2Title,
                  desc: ab.pillars.p2Desc
                },
                {
                  num: "03",
                  tag: ab.pillars.p3Tag,
                  title: ab.pillars.p3Title,
                  desc: ab.pillars.p3Desc
                }
              ].map((pillar) => (
                <div 
                  key={pillar.num}
                  className="relative overflow-hidden border border-[#8C421F]/30 p-6 sm:p-8 rounded-3xl bg-[#1A1E16] flex flex-col justify-between gap-6 shadow-xl hover:border-[#8C421F] transition-all duration-300 group active:scale-[0.99]"
                >
                  {/* Decorative top accent gradient bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8C421F] via-[#B66C48] to-[#8C421F]"></div>

                  {/* Watermark Numeral */}
                  <span className="font-serif text-6xl sm:text-7xl font-bold text-[#E8DACB]/5 group-hover:text-[#8C421F]/15 absolute top-4 right-6 pointer-events-none select-none transition-colors duration-300">
                    {pillar.num}
                  </span>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-xl bg-[#8C421F]/20 border border-[#8C421F]/30 flex items-center justify-center font-serif text-xs font-bold text-[#B66C48]">
                        {pillar.num}
                      </span>
                      <span className="font-sans text-[10px] tracking-widest uppercase text-[#B66C48] font-bold">
                        {pillar.tag}
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif text-[#E8DACB] font-normal mb-3 group-hover:text-white transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-[#E8DACB]/80 text-xs sm:text-sm leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#8C421F]/20 flex items-center justify-between text-[10px] font-sans text-[#B66C48] uppercase tracking-widest font-semibold">
                    <span>DAKSHINA PRINCIPLE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C421F]"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Local Masonry & Craftsmanship focus */}
      {ab.masonry?.enabled && (
        <section className="mb-24 md:mb-32 container max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center bg-[#FDFBF7] p-8 md:p-14 rounded-3xl border border-[#8C421F]/25 shadow-xl">
            <div className="lg:col-span-6 relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-[#8C421F]/20 shadow-md">
              <Image 
                src="/images/portfolio_office.jpg" 
                alt="Teak timber workspace details illustrating regional craftsmanship" 
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover animate-fade-in"
              />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="font-sans text-xs tracking-[0.2em] uppercase text-[#8C421F] font-bold block">
                {ab.masonry.subtitle}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif leading-tight font-normal text-[#23281E]">
                {ab.masonry.title}
              </h2>
              {ab.masonry.p1 && (
                <p className="text-sm md:text-base text-[#23281E]/80 leading-relaxed font-light">
                  {ab.masonry.p1}
                </p>
              )}
              {ab.masonry.p2 && (
                <p className="text-sm md:text-base text-[#23281E]/80 leading-relaxed font-light">
                  {ab.masonry.p2}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
