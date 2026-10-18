"use client";

import { useState } from "react";

interface MaterialCanvasProps {
  type: "teak" | "clay" | "lime" | "stone";
}

export default function MaterialCanvas({ type }: MaterialCanvasProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16; // 16 deg tilt max
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const materialData = {
    teak: {
      title: "Nilambur Teak Timber",
      origin: "Nilambur Forest Reserves, Kerala",
      metrics: [
        { label: "Density", value: "720 kg/m³" },
        { label: "Oil Content", value: "Rich (Water Resistant)" },
        { label: "Grain", value: "Straight / Structural" }
      ],
      description: "Sourced sustainably. Naturally rich in silica and defensive oils, teak is used for structural pillars, screen grids, and custom canal decks.",
      bgColor: "bg-gradient-to-br from-[#A07040] via-[#855B33] to-[#603D1A]",
      vector: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-35" stroke="#FFFFFF" fill="none" strokeWidth="0.5">
          {/* Wood grain pattern */}
          <path d="M 0,20 Q 25,18 50,22 T 100,20" />
          <path d="M 0,40 Q 30,37 60,43 T 100,38" />
          <path d="M 0,60 Q 20,62 45,58 T 100,61" />
          <path d="M 0,80 Q 35,78 70,82 T 100,79" />
          {/* Growth rings */}
          <circle cx="50" cy="120" r="30" />
          <circle cx="50" cy="120" r="50" />
          <circle cx="50" cy="120" r="70" />
          <circle cx="50" cy="120" r="90" />
        </svg>
      )
    },
    clay: {
      title: "Hand-Fired Clay Tiles",
      origin: "Vazhicherry Clay Kilns, Alappuzha",
      metrics: [
        { label: "Porosity", value: "High (Air-breathing)" },
        { label: "Firing Temp", value: "950°C" },
        { label: "U-Value", value: "1.45 W/m²K" }
      ],
      description: "Molded from riverbed silt. High thermal mass absorbs mid-day solar radiation and releases heat slowly during cool nights.",
      bgColor: "bg-gradient-to-br from-[#D96B43] via-[#C65D35] to-[#993E1B]",
      vector: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-35" stroke="#FFFFFF" fill="none" strokeWidth="0.5">
          {/* Brick bond pattern */}
          <line x1="0" y1="20" x2="100" y2="20" />
          <line x1="0" y1="40" x2="100" y2="40" />
          <line x1="0" y1="60" x2="100" y2="60" />
          <line x1="0" y1="80" x2="100" y2="80" />
          
          <line x1="25" y1="0" x2="25" y2="20" />
          <line x1="75" y1="0" x2="75" y2="20" />
          
          <line x1="50" y1="20" x2="50" y2="40" />
          
          <line x1="25" y1="40" x2="25" y2="60" />
          <line x1="75" y1="40" x2="75" y2="60" />
          
          <line x1="50" y1="60" x2="50" y2="80" />
          
          <line x1="25" y1="80" x2="25" y2="100" />
          <line x1="75" y1="80" x2="75" y2="100" />
        </svg>
      )
    },
    lime: {
      title: "Chalky Lime Plaster Wash",
      origin: "Regional Slaked Lime Pits, Kerala",
      metrics: [
        { label: "pH Level", value: "12.4 (Antifungal)" },
        { label: "Curing Phase", value: "Carbon Absorption" },
        { label: "Texture", value: "Velvet Plaster Wash" }
      ],
      description: "Carbon-neutral wall coating. Formulated with slaked lime and local marble dust, capturing CO₂ while preventing monsoon mold.",
      bgColor: "bg-gradient-to-br from-[#F5F2EB] via-[#ECE8DE] to-[#DAD5C7]",
      vector: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30" stroke="#1A1A1A" fill="none" strokeWidth="0.5">
          {/* Stucco textures */}
          <path d="M 10,10 C 20,40 40,20 60,35 S 80,10 90,40" />
          <path d="M 5,50 C 35,45 20,80 70,65 S 65,95 95,75" />
          <path d="M 30,30 C 50,60 70,50 85,85" />
        </svg>
      )
    },
    stone: {
      title: "Slate Granite Base",
      origin: "Western Ghats Escarpments, Kerala",
      metrics: [
        { label: "Hardness", value: "6.5 Mohs" },
        { label: "Absorption", value: "< 0.15% (Waterproof)" },
        { label: "Finish", value: "Flamed / Rough Cut" }
      ],
      description: "Low-porosity slate blocks. Anchors structural pillars above high tide water marks, preventing capillary water rising.",
      bgColor: "bg-gradient-to-br from-[#3D4744] via-[#2F3735] to-[#1E2221]",
      vector: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-35" stroke="#FFFFFF" fill="none" strokeWidth="0.5">
          {/* Granular slate cracks and flakes */}
          <polygon points="10,15 45,8 55,25 35,30" />
          <polygon points="55,25 90,20 85,45 65,40" />
          <polygon points="15,65 50,55 60,80 30,90" />
          <line x1="0" y1="45" x2="100" y2="55" />
          <line x1="35" y1="30" x2="15" y2="65" strokeDasharray="2 2" />
        </svg>
      )
    }
  };

  const data = materialData[type];

  return (
    <div 
      className="relative w-full aspect-[4/3] rounded-sm border border-charcoal/5 overflow-hidden select-none cursor-pointer flex flex-col justify-between transition-shadow duration-500 hover:shadow-lg"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        transform: `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg)`,
        transition: "transform 0.15s ease-out, shadow 0.3s ease-out",
        transformStyle: "preserve-3d"
      }}
    >
      {/* Background Graphic representing Texture */}
      <div className={`absolute inset-0 z-0 transition-transform duration-500 ${data.bgColor} ${isHovered ? "scale-105" : "scale-100"}`}>
        {data.vector}
      </div>

      {/* Glassmorphic Dark Overlay */}
      <div className="absolute inset-0 bg-charcoal/10 pointer-events-none z-10"></div>

      {/* Header coordinates */}
      <div 
        className="relative z-20 p-4 md:p-6 flex justify-between items-start text-white transition-transform duration-300"
        style={{ transform: "translateZ(25px)" }}
      >
        <div>
          <span className={`font-sans text-[8px] font-semibold tracking-widest uppercase opacity-75 ${type === "lime" ? "text-charcoal" : "text-white"}`}>
            Material Swatch
          </span>
          <h4 className={`font-serif text-lg font-normal tracking-tight mt-0.5 ${type === "lime" ? "text-charcoal" : "text-white"}`}>
            {data.title}
          </h4>
        </div>
        <span className={`font-sans text-[9px] uppercase tracking-widest font-light ${type === "lime" ? "text-charcoal/60" : "text-white/60"}`}>
          {type.toUpperCase()} {" // "} 00{type === "teak" ? "1" : type === "clay" ? "2" : type === "lime" ? "3" : "4"}
        </span>
      </div>

      {/* Dynamic Slide-up Data Details Panel */}
      <div 
        className={`relative z-20 w-full p-4 md:p-6 bg-[#F9F6F0] border-t border-charcoal/5 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isHovered ? "translate-y-0 opacity-100" : "translate-y-[62%] opacity-90"
        }`}
        style={{ transform: "translateZ(40px)" }}
      >
        <span className="font-sans text-[8px] font-semibold tracking-widest uppercase text-clay block mb-1">
          Architectural Properties
        </span>
        
        {/* Core gauges */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-charcoal/5 mb-3">
          {data.metrics.map((metric, i) => (
            <div key={i}>
              <span className="font-sans text-[7px] text-sage tracking-wider uppercase block">{metric.label}</span>
              <span className="font-sans text-[9px] font-medium text-charcoal block mt-0.5">{metric.value}</span>
            </div>
          ))}
        </div>

        <p className="font-sans text-[10px] font-light leading-relaxed text-charcoal/85 opacity-0 hover:opacity-100 transition-opacity duration-300">
          {data.description}
        </p>
        <div className="flex justify-between items-center text-[8px] font-sans text-sage uppercase tracking-wider mt-1">
          <span>Source: {data.origin}</span>
          <span className="text-clay font-semibold animate-pulse">Tactile Match</span>
        </div>
      </div>
    </div>
  );
}
