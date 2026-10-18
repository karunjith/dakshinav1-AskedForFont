import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TMP_DATA_DIR = path.join("/tmp", "dakshina-data");

// In-memory runtime cache for serverless environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memCache = new Map<string, any>();

let resolvedDataDir: string | null = null;

// Helper to determine active directory and guarantee existence
function getDataDir(): string {
  if (resolvedDataDir) return resolvedDataDir;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Test write permission
    const testFile = path.join(DATA_DIR, ".write-test");
    fs.writeFileSync(testFile, "ok");
    try { fs.unlinkSync(testFile); } catch {}
    resolvedDataDir = DATA_DIR;
    return DATA_DIR;
  } catch {
    // Vercel serverless read-only filesystem fallback
    try {
      if (!fs.existsSync(TMP_DATA_DIR)) {
        fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
      }
      resolvedDataDir = TMP_DATA_DIR;
      return TMP_DATA_DIR;
    } catch {
      resolvedDataDir = DATA_DIR;
      return DATA_DIR;
    }
  }
}

// Ensure data files exist in active directory
function getFilePath(filename: string): string {
  const activeDir = getDataDir();
  const activePath = path.join(activeDir, filename);
  
  // If active is /tmp and file doesn't exist there yet, copy from bundled repo DATA_DIR
  if (activeDir !== DATA_DIR && !fs.existsSync(activePath)) {
    const bundledPath = path.join(DATA_DIR, filename);
    if (fs.existsSync(bundledPath)) {
      try {
        fs.copyFileSync(bundledPath, activePath);
      } catch (err) {
        console.warn(`Failed to copy bundled ${filename} to /tmp:`, err);
      }
    }
  }
  return activePath;
}

const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function isCloudStorageConnected(): boolean {
  return Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);
}

// Remote KV helpers for Vercel KV / Upstash Redis
export async function getRemoteKV<T>(key: string): Promise<T | null> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  try {
    const res = await fetch(`${KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.result !== null && json.result !== undefined) {
      return typeof json.result === "string" ? JSON.parse(json.result) : json.result;
    }
  } catch (err) {
    console.warn(`[KV Engine] Error fetching remote key ${key}:`, err);
  }
  return null;
}

export async function setRemoteKV<T>(key: string, value: T): Promise<boolean> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return false;
  try {
    const payload = JSON.stringify(value);
    const res = await fetch(`${KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    return res.ok;
  } catch (err) {
    console.warn(`[KV Engine] Error saving remote key ${key}:`, err);
    return false;
  }
}

// Atomic file readers & writers with memory cache and remote cloud fallback
export function readDataFile<T>(filename: string, defaultData: T): T {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    // Check memory cache first if updated in current serverless worker
    if (memCache.has(filename)) {
      return memCache.get(filename) as T;
    }
    // Check bundled path fallback
    const bundledPath = path.join(DATA_DIR, filename);
    if (fs.existsSync(bundledPath)) {
      try {
        const content = fs.readFileSync(bundledPath, "utf8");
        const parsed = JSON.parse(content) as T;
        memCache.set(filename, parsed);
        return parsed;
      } catch {}
    }
    memCache.set(filename, defaultData);
    return defaultData;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content) as T;
    memCache.set(filename, parsed);
    return parsed;
  } catch (error) {
    if (memCache.has(filename)) {
      return memCache.get(filename) as T;
    }
    console.error(`Error reading data file ${filename}:`, error);
    return defaultData;
  }
}

export async function readDataFileAsync<T>(filename: string, defaultData: T): Promise<T> {
  const remote = await getRemoteKV<T>(filename);
  if (remote !== null) {
    memCache.set(filename, remote);
    return remote;
  }
  return readDataFile<T>(filename, defaultData);
}

export function writeDataFile<T>(filename: string, data: T): boolean {
  // Always update in-memory cache instantly
  memCache.set(filename, data);

  // Background sync to cloud KV if available
  if (KV_REST_API_URL && KV_REST_API_TOKEN) {
    setRemoteKV(filename, data).catch((err) => {
      console.warn(`[KV Engine] Async background sync failed for ${filename}:`, err);
    });
  }

  const filePath = getFilePath(filename);
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempPath, filePath);

    // Touch sync-meta.json on every write so clients always detect changes
    if (filename !== "sync-meta.json") {
      try {
        const metaPath = getFilePath("sync-meta.json");
        const metaTemp = `${metaPath}.tmp`;
        const metaData = { lastSaved: Date.now() };
        fs.writeFileSync(metaTemp, JSON.stringify(metaData, null, 2), "utf8");
        fs.renameSync(metaTemp, metaPath);
        memCache.set("sync-meta.json", metaData);
      } catch {}
    }

    return true;
  } catch (error) {
    console.error(`Filesystem write failed for ${filename}, saved in-memory:`, error);
    return true;
  }
}

export async function writeDataFileAsync<T>(filename: string, data: T): Promise<boolean> {
  memCache.set(filename, data);
  if (KV_REST_API_URL && KV_REST_API_TOKEN) {
    await setRemoteKV(filename, data);
    if (filename !== "sync-meta.json") {
      await setRemoteKV("sync-meta.json", { lastSaved: Date.now() });
    }
  }
  return writeDataFile<T>(filename, data);
}

// Type definitions
export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  year: string;
  area: string;
  materials: string[];
  description: string;
  image: string; // Cover image path
  images: string[]; // Slideshow images list
  status: "Draft" | "Published";
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Service {
  id: string;
  title: string;
  desc: string;
  bannerImage: string;
  gallery: string[];
  icon: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  review: string;
  rating: number;
  clientImage: string;
  relatedProject?: string;
  featured: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  service?: string;
  budget?: string;
  message?: string;
  sourcePage?: string;
  submissionTime: string;
  status: "New" | "Contacted" | "Quote Sent" | "Won" | "Lost";
  internalNotes?: string;
  location?: string;
}

export interface QuoteRequest {
  id: string;
  propertyType: string;
  budget: string;
  area: string;
  timeline: string;
  requirements?: string;
  submissionTime: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  status: "Draft" | "Published";
  publishDate: string; // ISO String or scheduled timestamp
  metaTitle?: string;
  metaDescription?: string;
}

export interface SectionContent {
  enabled: boolean;
  [key: string]: unknown;
}

export interface WebsiteContent {
  home: {
    introAnimation?: {
      enabled: boolean;
      desktop?: boolean;
      tablet?: boolean;
      mobile?: boolean;
    };
    hero: {
      enabled: boolean;
      title1: string;
      title2: string;
      description: string;
      cta: string;
    };
    heroCollage?: string[];
    philosophy: {
      enabled: boolean;
      title: string;
      p1: string;
      p2: string;
      cta: string;
    };
    creations: {
      enabled: boolean;
      title: string;
      subtitle: string;
    };
    manifesto: {
      enabled: boolean;
      title: string;
      description: string;
    };
    process: {
      enabled: boolean;
      title: string;
      subtitle: string;
      description: string;
    };
    testimonials: {
      enabled: boolean;
      title: string;
      subtitle: string;
    };
    coordinates: {
      enabled: boolean;
      title: string;
      subtitle: string;
    };
  };
  about: {
    hero: {
      enabled: boolean;
      title: string;
      subtitle: string;
      description: string;
    };
    philosophy: {
      enabled: boolean;
      quote: string;
      p1: string;
      p2: string;
      p3: string;
    };
    pillars: {
      enabled: boolean;
      title: string;
      subtitle: string;
      p1Tag: string;
      p1Title: string;
      p1Desc: string;
      p2Tag: string;
      p2Title: string;
      p2Desc: string;
      p3Tag: string;
      p3Title: string;
      p3Desc: string;
    };
    masonry: {
      enabled: boolean;
      title: string;
      subtitle: string;
      p1: string;
      p2: string;
    };
  };
  services: {
    hero: {
      enabled: boolean;
      title: string;
      subtitle: string;
      description: string;
    };
    workflow: {
      enabled: boolean;
      title: string;
      subtitle: string;
      p1Num: string;
      p1Title: string;
      p1Desc: string;
      p2Num: string;
      p2Title: string;
      p2Desc: string;
      p3Num: string;
      p3Title: string;
      p3Desc: string;
      p4Num: string;
      p4Title: string;
      p4Desc: string;
    };
    materials: {
      enabled: boolean;
      title: string;
      subtitle: string;
      m1Title: string;
      m1Desc: string;
      m2Title: string;
      m2Desc: string;
      m3Title: string;
      m3Desc: string;
      m4Title: string;
      m4Desc: string;
    };
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ipAddress?: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 for secure session checks
  role: "Super Admin" | "Admin" | "Editor" | "Content Manager";
  email: string;
  name: string;
}

export interface BusinessSettings {
  companyName: string;
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  businessHours: string;
  googleMapsEmbedUrl: string;
  instagramUrl?: string;
  pinterestUrl?: string;
  linkedinUrl?: string;
  // Notification integrations
  telegramEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  emailEnabled?: boolean;
  resendApiKey?: string;
  senderEmail?: string;
  recipientEmail?: string;
}

export interface HomepageContent {
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  manifestoTitle: string;
  manifestoDescription: string;
}

// Seeding Default Database Values
const defaultProjects: Project[] = [
  {
    id: "proj-1",
    title: "The Backwater Pavilion",
    slug: "backwater-pavilion",
    category: "Residential",
    location: "Alappuzha",
    year: "2025",
    area: "2,850 sq.ft.",
    materials: ["Reclaimed Teak", "Local Clay tiles", "Polished Granite"],
    description: "A climate-responsive lakefront residence designed along Alappuzha's coastal channels. It features floating timber decks, pitched clay roof rafters, and sliding louvers that capture lake breezes while shielding extreme monsoon rainfall.",
    image: "/images/hero_interior.jpg",
    images: ["/images/hero_interior.jpg", "/images/portfolio_dining.jpg", "/images/portfolio_office.jpg"],
    status: "Published",
    featured: true,
    metaTitle: "The Backwater Pavilion | Residential Architectural Design Alappuzha",
    metaDescription: "Explore a modern waterfront villa built in traditional Nalukettu physics, blending teak frames and clay roofs."
  },
  {
    id: "proj-2",
    title: "Kuttanad Heritage Modern",
    slug: "kuttanad-heritage-modern",
    category: "Residential",
    location: "Kuttanad",
    year: "2026",
    area: "3,100 sq.ft.",
    materials: ["Handmade clay blocks", "Breathable lime wash", "Brass joinery"],
    description: "An adaptive restoration of a heritage Kuttanad courtyard homestead. The layout incorporates elevated stone plinths to adapt to backwater tide rises, central open light wells for air circulation, and solid teak joints.",
    image: "/images/portfolio_dining.jpg",
    images: ["/images/portfolio_dining.jpg", "/images/portfolio_office.jpg", "/images/slider_after.jpg"],
    status: "Published",
    featured: true,
    metaTitle: "Kuttanad Heritage Restoration | Traditional Kerala Architecture",
    metaDescription: "See how we restored a heritage courtyard Nalukettu to be climate-resilient with elevated stone plinths."
  },
  {
    id: "proj-3",
    title: "Vazhicherry Creative Studio",
    slug: "vazhicherry-creative-studio",
    category: "Commercial",
    location: "Alappuzha",
    year: "2024",
    area: "1,200 sq.ft.",
    materials: ["Local teak partitions", "Polished plaster wash", "Basalt floor slabs"],
    description: "A minimalist, light-flooded workspace pavilion designed for a creative studio in Vazhicherry. Built with operable wooden screen grids to provide cross-ventilation overlooking a lily pond.",
    image: "/images/portfolio_office.jpg",
    images: ["/images/portfolio_office.jpg", "/images/slider_after.jpg", "/images/hero_interior.jpg"],
    status: "Published",
    featured: true,
    metaTitle: "Vazhicherry Creative Studio | Minimalist Commercial Interiors",
    metaDescription: "An open workspace pavilion designed with pivoted teak lattices and polished cement textures."
  },
  {
    id: "proj-4",
    title: "Alleppey Canal House",
    slug: "alleppey-canal-house",
    category: "Renovation",
    location: "Alappuzha",
    year: "2025",
    area: "1,950 sq.ft.",
    materials: ["Polished cement screed", "Terracotta masonry", "Oak rafters"],
    description: "A modern renovation of an urban canal-side cottage in Alappuzha. Employs brick latticework screens that buffer street humidity, filter incoming dust, and capture cooling wind flows off the canal.",
    image: "/images/slider_after.jpg",
    images: ["/images/slider_after.jpg", "/images/hero_interior.jpg", "/images/portfolio_dining.jpg"],
    status: "Published",
    featured: true,
    metaTitle: "Alleppey Canal House | Modern Cottage Renovation",
    metaDescription: "Restoring an urban brick cottage using terracotta screens and breeze-sifting joinery grids."
  }
];

const defaultServices: Service[] = [
  {
    id: "serv-1",
    title: "Climatic Passive Architecture",
    desc: "Maximizing passive cooling. We coordinate window elevations, high ceilings, and adjustable wooden louvers to guide tropical wind currents, keeping interiors comfortable naturally without mechanical AC units.",
    bannerImage: "/images/hero_interior.jpg",
    gallery: ["/images/hero_interior.jpg"],
    icon: "Wind"
  },
  {
    id: "serv-2",
    title: "Material Responsibility",
    desc: "Sourcing textures that age gracefully. We prioritize porous terracotta floor tiles, local rough slate stone, lime plaster coating, and reclaimed teak timber from old razed structures.",
    bannerImage: "/images/portfolio_dining.jpg",
    gallery: ["/images/portfolio_dining.jpg"],
    icon: "Hammer"
  },
  {
    id: "serv-3",
    title: "Spatial Stillness & Negative Space",
    desc: "Curation over decoration. By simplifying hallways, installing concealed built-in storage, and designing custom clean timber furniture, we allow the eye to rest and emphasize natural light drafts.",
    bannerImage: "/images/portfolio_office.jpg",
    gallery: ["/images/portfolio_office.jpg"],
    icon: "Layout"
  }
];

const defaultTestimonials: Testimonial[] = [
  {
    id: "testi-1",
    clientName: "Dr. Menon",
    review: "The Backwater Pavilion feels like an extension of the lagoon itself. The floating teak deck has become our family's absolute sanctuary.",
    rating: 5,
    clientImage: "/images/parallax_courtyard.jpg",
    relatedProject: "proj-1",
    featured: true
  },
  {
    id: "testi-2",
    clientName: "Rekha Thomas",
    review: "Their respect for traditional Nalukettu courtyard physics transformed our old ancestral property into a breezy, modern homestead.",
    rating: 5,
    clientImage: "/images/parallax_study.jpg",
    relatedProject: "proj-2",
    featured: true
  },
  {
    id: "testi-3",
    clientName: "James Mathew",
    review: "A minimalist masterpiece. Every line has a purpose, from the local clay tiles to the breeze-sifting wooden grids.",
    rating: 5,
    clientImage: "/images/parallax_dining.jpg",
    relatedProject: "proj-3",
    featured: true
  }
];

const defaultSettings: BusinessSettings = {
  companyName: "DAKSHINA ARCHITECTS",
  logo: "/images/logo.png",
  phone: "+91 88486 66041",
  whatsapp: "+918848666041",
  email: "dakshinaarchitects@gmail.com",
  address: "310B Junction, Vazhicherry Ward, Alappuzha, Kerala – 688001",
  businessHours: "Monday – Saturday: 9:00 AM – 6:00 PM",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.4385966601614!2d76.32626071478952!3d9.501584293183576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0884d5dfd17887%3A0xe96c4d7ec6a6d65c!2sVazhicherry%20Ward%2C%20Alappuzha%2C%20Kerala%20688001!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin",
  instagramUrl: "https://www.instagram.com/dakshinaarchitects",
  pinterestUrl: "https://www.pinterest.com/dakshinaarchitects",
  linkedinUrl: "https://www.linkedin.com/company/dakshina-architects",
  telegramEnabled: false,
  telegramBotToken: "",
  telegramChatId: "",
  emailEnabled: false,
  resendApiKey: "",
  senderEmail: "onboarding@resend.dev",
  recipientEmail: "dakshinaarchitects@gmail.com"
};

const defaultHomepage: HomepageContent = {
  heroTitleLine1: "Designing Stillness.",
  heroTitleLine2: "Fusing Heritage.",
  heroDescription: "We design climate-resilient, minimalist architecture along the coastal waters of Kerala. By harmonizing traditional courtyard physics with contemporary spatial stillness, we craft spaces that breathe with the monsoons.",
  manifestoTitle: "Architecture is the choreography of light, drafts, and native timber.",
  manifestoDescription: "Our spaces are designed to live alongside the coastal winds of Alappuzha. By utilizing modern engineering grids with time-tested structural layouts like the open-sky courtyard, we build climate-resilient shelters that adapt naturally to seasonal changes."
};

const defaultWebsiteContent: WebsiteContent = {
  home: {
    hero: {
      enabled: true,
      title1: "dakshina",
      title2: "architects",
      description: "We design climate-resilient, minimalist architecture along the coastal waters of Kerala. By harmonizing traditional courtyard physics with contemporary spatial stillness, we craft spaces that breathe with the monsoons.",
      cta: "Inquire About A Project"
    },
    heroCollage: [
      "/images/hero_carousel_1.jpg",
      "/images/hero_carousel_2.jpg",
      "/images/hero_carousel_3.jpg",
      "/images/hero_carousel_4.jpg",
      "/images/hero_carousel_5.jpg"
    ],
    philosophy: {
      enabled: true,
      title: "A quiet conversation with space and material.",
      p1: "In the humid tropics of Kerala, architecture has historically functioned as a shield and a sieve. Traditional *Nalukettu* homesteads integrated open courtyards to facilitate convective airflow, cooling living halls without mechanical assistance.",
      p2: "Dakshina Architects builds on this ancestral logic. We remove unnecessary partitions to embrace negative space, selecting local, tactile materials—hand-fired clay blocks, lime plaster coatings, and reclaimed teak—that reflect the texture of our landscape.",
      cta: "Read Our Thesis"
    },
    creations: {
      enabled: true,
      title: "Best Creations",
      subtitle: "Masterpieces"
    },
    manifesto: {
      enabled: true,
      title: "Architecture is the choreography of light, drafts, and native timber.",
      description: "Our spaces are designed to live alongside the coastal winds of Alappuzha. By utilizing modern engineering grids with time-tested structural layouts like the open-sky courtyard, we build climate-resilient shelters that adapt naturally to seasonal changes."
    },
    process: {
      enabled: true,
      title: "Before & After",
      subtitle: "THE PROCESS",
      description: "Interact with the divider handle to reveal how we construct structural beauty from raw concrete blocks."
    },
    testimonials: {
      enabled: true,
      title: "Client Testimonials",
      subtitle: "PATRON REFLECTIONS"
    },
    coordinates: {
      enabled: true,
      title: "Visit the Studio.",
      subtitle: "HQ Coordinates"
    }
  },
  about: {
    hero: {
      enabled: true,
      title: "Our Thesis",
      subtitle: "DAKSHINA ARCHITECTS",
      description: "We believe architecture is a slow dialogue between climate, locale, and structural stillness."
    },
    philosophy: {
      enabled: true,
      quote: "We design layouts that breathe with the changing tropical seasons, framing simple foliage, and quietening the daily mind.",
      p1: "Traditional architecture along the backwaters of Alappuzha was built to flow with the tides and winds. Master builders crafted timber structures centered around open-air courtyards (*nadumuttam*) and raised stone plinths to counter monsoonal humidity and adapting to rising water levels.",
      p2: "At Dakshina Architects, we translate this climate-responsive design logic into clean, contemporary living spaces. By stripping away superficial details and focusing on clean geometry, we let the natural textures of timber joinery, lime-washed plaster, and hand-molded terracotta take precedence.",
      p3: "We believe a home is a sanctuary. Our layouts focus on negative space, guiding path transitions to invoke a sense of calm, order, and connection to the local environment."
    },
    pillars: {
      enabled: true,
      title: "Our Design Pillars",
      subtitle: "STRUCTURE",
      p1Tag: "01 // TROPICAL VENTILATION",
      p1Title: "Climatic Integration",
      p1Desc: "Maximizing passive cooling. We coordinate window elevations, high ceilings, and adjustable wooden louvers to guide tropical wind currents, keeping interiors comfortable naturally.",
      p2Tag: "02 // TEXTURE TRUTH",
      p2Title: "Material Responsibility",
      p2Desc: "Sourcing textures that age gracefully. We prioritize porous terracotta floor tiles, local rough slate stone, lime plaster coating, and reclaimed teak timber.",
      p3Tag: "03 // NEGATIVE SPACE",
      p3Title: "Spatial Stillness",
      p3Desc: "Curation over decoration. By simplifying hallways, installing concealed built-in storage, and designing custom clean timber furniture, we allow the eye to rest."
    },
    masonry: {
      enabled: true,
      title: "Sourcing & Collaboration",
      subtitle: "Craftsmanship",
      p1: "Every detail in a Dakshina Architects project—from the clean joints of our teak frames to the hand-laid clay bricks—is created in partnership with regional masons and wood artisans across Kerala.",
      p2: "By working alongside local guilds, we ensure that traditional carpentry and building techniques remain viable, while giving each home a level of tactile depth that prefabricated factory imports cannot mimic."
    }
  },
  services: {
    hero: {
      enabled: true,
      title: "Our Design Flow.",
      subtitle: "Expertise",
      description: ""
    },
    workflow: {
      enabled: true,
      title: "Methodology & Execution",
      subtitle: "Workflow",
      p1Num: "Phase 01",
      p1Title: "Spatial Mapping & Feasibility",
      p1Desc: "We begin with site mapping: analyzing passive solar angles, seasonal monsoon wind vectors for optimal cross-ventilation, sightlines, and topographic contours. We establish structural goals, scale parameters, and layout possibilities.",
      p2Num: "Phase 02",
      p2Title: "Architectural Drafting & 3D Curation",
      p2Desc: "We translate programmatic needs into detailed structural blueprints and 3D architectural spaces. Light wells, natural ventilation pathways, negative space, and custom joinery mockups are established, allowing a clean walkthrough of the layout.",
      p3Num: "Phase 03",
      p3Title: "Tactile Material Palette Curation",
      p3Desc: "We handpick every raw surface. This is a deliberate process of matching textures: porous terracotta clay blocks, lime wash plaster samples, machined brass joinery details, and solid reclaimed teak blocks to ensure physical harmony.",
      p4Num: "Phase 04",
      p4Title: "Site Supervision & Guild Liaison",
      p4Desc: "We supervise structural execution directly on-site. Our design team collaborates directly with wood artisans and stonemasons to guarantee joinery fits, detail alignments, and material finishes conform to our specifications."
    },
    materials: {
      enabled: true,
      title: "Tactile Sourcing Guides",
      subtitle: "Materiality",
      m1Title: "Teak Timber",
      m1Desc: "Reclaimed wood featuring detailed grain lines. We craft bespoke ceiling frames and screens that enrich structural density.",
      m2Title: "Fired Clay",
      m2Desc: "Porous terracotta floor tiling and screen grids. Provides heat insulation underfoot and guides convective breeze paths.",
      m3Title: "Lime Plaster Wash",
      m3Desc: "Ancestral wall coatings. We apply breathable lime washes that buffer interior moisture levels and softly reflect daylight.",
      m4Title: "Local Stone",
      m4Desc: "Rough-cut dark slate walls or custom polished granite steps. Sourced from local quarries for low-carbon material footprint."
    }
  }
};

// Seed a default admin user.
const defaultUsers: User[] = [
  {
    id: "user-1",
    username: "admin",
    passwordHash: "a1ee4013af47790a69a61245b661913547fc83d9e82fac1b93ec8a555c7e5fef",
    role: "Super Admin",
    email: "dakshinaarchitects@gmail.com",
    name: "Dakshina Admin"
  }
];

// Seed databases if empty
export function initDb() {
  readDataFile<Project[]>("projects.json", defaultProjects);
  readDataFile<Service[]>("services.json", defaultServices);
  readDataFile<Testimonial[]>("testimonials.json", defaultTestimonials);
  readDataFile<BusinessSettings>("settings.json", defaultSettings);
  readDataFile<HomepageContent>("homepage.json", defaultHomepage);
  readDataFile<WebsiteContent>("website-content.json", defaultWebsiteContent);
  readDataFile<User[]>("users.json", defaultUsers);
  readDataFile<Lead[]>("leads.json", []);
  readDataFile<BlogPost[]>("blog.json", []);
  readDataFile<AuditLog[]>("audit-logs.json", [
    {
      id: "log-init",
      timestamp: new Date().toISOString(),
      user: "System",
      action: "Database Seeding",
      target: "System Initialisation",
      ipAddress: "127.0.0.1"
    }
  ]);
}

// Append-only audit log recorder
export function recordAuditLog(user: string, action: string, target: string, ipAddress?: string) {
  const logs = readDataFile<AuditLog[]>("audit-logs.json", []);
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    target,
    ipAddress: ipAddress || "127.0.0.1"
  };
  logs.push(newLog);
  writeDataFile<AuditLog[]>("audit-logs.json", logs);
}

// Automatically initialize databases on first module import
initDb();
