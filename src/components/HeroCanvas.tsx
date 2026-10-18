"use client";



export default function HeroCanvas() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    e.currentTarget.style.setProperty("--mx", `${x}`);
    e.currentTarget.style.setProperty("--my", `${y}`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  return (
    <div 
      className="relative w-full aspect-[4/3] rounded-xs bg-[#FAF8F5] border border-charcoal/10 flex items-center justify-center p-6 md:p-8 overflow-hidden select-none cursor-crosshair shadow-sm hover:shadow-md transition-shadow duration-500"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. ARCHITECTURAL DRAFT GRID */}
      <div 
        className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0 pointer-events-none opacity-[0.12] transition-transform duration-300"
        style={{
          transform: "translate3d(calc(var(--mx, 0) * 0.32px), calc(var(--my, 0) * 0.32px), 0)",
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="border-b border-r border-charcoal/60 w-full h-full"></div>
        ))}
      </div>

      {/* 2. DRAFTING GUIDELINES & DIMENSION MARKS */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          transform: "translate3d(calc(var(--mx, 0) * 0.64px), calc(var(--my, 0) * 0.64px), 0)",
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <svg viewBox="0 0 400 300" className="w-full h-full stroke-charcoal/30 fill-none" strokeWidth="0.5">
          {/* Elevation lines */}
          <line x1="20" y1="230" x2="380" y2="230" />
          <line x1="20" y1="70" x2="380" y2="70" strokeDasharray="3 3" />
          <line x1="200" y1="20" x2="200" y2="280" strokeDasharray="2 4" />
          
          {/* Rafter extension projections */}
          <line x1="80" y1="70" x2="80" y2="230" strokeDasharray="1 3" />
          <line x1="320" y1="70" x2="320" y2="230" strokeDasharray="1 3" />

          {/* Dimension arrows */}
          <path d="M 40,70 L 40,230 M 35,75 L 40,70 L 45,75 M 35,225 L 40,230 L 45,225" />
          <path d="M 80,250 L 320,250 M 85,245 L 80,250 L 85,255 M 315,245 L 320,250 L 315,255" />
          
          {/* Circles representing pivots */}
          <circle cx="200" cy="150" r="110" strokeDasharray="2 6" />
        </svg>
      </div>

      {/* 3. THE ARTISTIC SKETCH: Modern Kerala Waterfront Pavilion */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          transform: "translate3d(calc(var(--mx, 0) * 1.44px), calc(var(--my, 0) * 1.44px), 0)",
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <svg viewBox="0 0 400 300" className="w-full h-full stroke-charcoal fill-none" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
          
          {/* Ground Plinth Foundation */}
          <polygon points="60,230 340,230 320,240 80,240" fill="#1A1A1A" fillOpacity="0.03" />
          <line x1="60" y1="230" x2="340" y2="230" strokeWidth="1.5" />
          
          {/* Main Teak Columns */}
          <line x1="90" y1="230" x2="90" y2="125" strokeWidth="2.5" />
          <line x1="160" y1="230" x2="160" y2="125" strokeWidth="2.0" />
          <line x1="240" y1="230" x2="240" y2="125" strokeWidth="2.0" />
          <line x1="310" y1="230" x2="310" y2="125" strokeWidth="2.5" />
          
          {/* Pedestal detail blocks */}
          <rect x="86" y="222" width="8" height="8" fill="#F9F6F0" strokeWidth="1" />
          <rect x="306" y="222" width="8" height="8" fill="#F9F6F0" strokeWidth="1" />

          {/* Roof Structure: Pitched rafters (Traditional Padippura/Nalukettu look) */}
          {/* Main triangular roof slope */}
          <polygon points="200,60 350,135 340,140 200,70 60,140 50,135" fill="#1A1A1A" fillOpacity="0.05" strokeWidth="1.25" />
          
          {/* Under-roof rafter support beams */}
          <line x1="90" y1="125" x2="310" y2="125" strokeWidth="2.0" />
          <line x1="100" y1="125" x2="200" y2="75" strokeWidth="0.75" />
          <line x1="300" y1="125" x2="200" y2="75" strokeWidth="0.75" />
          <line x1="160" y1="125" x2="200" y2="75" strokeWidth="0.75" />
          <line x1="240" y1="125" x2="200" y2="75" strokeWidth="0.75" />

          {/* Eaves brackets details */}
          <path d="M 90,125 Q 70,125 65,135" strokeWidth="1" />
          <path d="M 310,125 Q 330,125 335,135" strokeWidth="1" />

          {/* Modern timber louver screen details (Right Side) */}
          <g strokeWidth="0.5" opacity="0.6">
            <line x1="248" y1="125" x2="248" y2="230" />
            <line x1="256" y1="125" x2="256" y2="230" />
            <line x1="264" y1="125" x2="264" y2="230" />
            <line x1="272" y1="125" x2="272" y2="230" />
            <line x1="280" y1="125" x2="280" y2="230" />
            <line x1="288" y1="125" x2="288" y2="230" />
            <line x1="296" y1="125" x2="296" y2="230" />
            <line x1="304" y1="125" x2="304" y2="230" />
          </g>

          {/* Floating wood deck detail (Left Side) */}
          <g strokeWidth="0.75">
            <polygon points="50,230 90,230 80,245 40,245" fill="#1A1A1A" fillOpacity="0.05" />
            <line x1="50" y1="230" x2="40" y2="245" />
            <line x1="80" y1="230" x2="70" y2="245" />
            <line x1="60" y1="230" x2="50" y2="245" />
            <line x1="40" y1="245" x2="80" y2="245" strokeWidth="1" />
          </g>
          
          {/* Water level lines indicating canal edge */}
          <path d="M 30,250 C 45,248 55,252 70,250 C 85,248 95,252 110,250" opacity="0.4" strokeWidth="0.5" />
          <path d="M 20,255 C 35,253 45,257 60,255" opacity="0.2" strokeWidth="0.5" />
        </svg>
      </div>

      {/* 4. TECHNICAL TEXT ANNOTATIONS */}
      <div className="absolute inset-x-6 bottom-6 flex justify-between items-end pointer-events-none font-sans text-charcoal/60">
        <div>
          <span className="text-[9px] font-bold tracking-widest block uppercase text-clay">PADIPPURA SECTION C-01</span>
          <span className="text-[7px] tracking-wider block opacity-70 mt-0.5">DAKSHINA ARCHITECTS</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-medium block">CLAY ROOF ANGLE &middot; 32°</span>
          <span className="text-[7px] opacity-70 block">SCALE 1:50 &middot; ALAPPUZHA</span>
        </div>
      </div>
      
      {/* Drafting Compass overlay top-right */}
      <div className="absolute top-6 right-6 w-8 h-8 opacity-25 pointer-events-none">
        <svg viewBox="0 0 30 30" className="w-full h-full stroke-charcoal fill-none" strokeWidth="0.5">
          <circle cx="15" cy="15" r="12" />
          <line x1="15" y1="3" x2="15" y2="27" />
          <line x1="3" y1="15" x2="27" y2="15" />
          <path d="M 15,6 L 17,15 L 15,24 L 13,15 Z" fill="#1A1A1A" />
          <text x="13" y="10" className="font-sans text-[5px] font-bold" fill="#1A1A1A">N</text>
        </svg>
      </div>
      
    </div>
  );
}
