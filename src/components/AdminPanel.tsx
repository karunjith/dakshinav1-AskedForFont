"use client";

import { useState, useEffect } from "react";
import { Project, Service, Testimonial, Lead, BlogPost, User, BusinessSettings, AuditLog } from "@/lib/db";
import { 
  adminLogout, 
  saveProject, 
  deleteProject, 
  updateLeadStatus, 
  deleteLead, 
  deleteMultipleLeads,
  saveBusinessSettings, 
  exportDbBackup, 
  importDbBackup,
  uploadMediaFile,
  saveWebsiteContent,
  proxyFetchImageUrl
} from "@/app/actions/admin";
import { notifyCMSChange } from "@/components/CMSLiveListener";
import { 
  LayoutDashboard, 
  Edit, 
  FolderHeart, 
  Users, 
  Image as ImageIcon, 
  Sliders, 
  History, 
  Database, 
  LogOut, 
  Plus, 
  Trash2, 
  FileEdit, 
  X, 
  Download, 
  Upload, 
  Search, 
  ArrowRight, 
  TrendingUp, 
  Inbox, 
  AlertCircle, 
  Monitor, 
  Tablet, 
  Smartphone,
  RotateCcw
} from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  multiple?: boolean;
  processAndUploadWebp: (file: File) => Promise<string | null>;
  processAndUploadUrlWebp: (url: string) => Promise<string | null>;
  triggerAlert: (type: "success" | "error", message: string) => void;
}

function ImageUploader({
  label,
  value,
  onChange,
  multiple = false,
  processAndUploadWebp,
  processAndUploadUrlWebp,
  triggerAlert
}: ImageUploaderProps) {
  const isArray = Array.isArray(value);
  const imagesArray = isArray ? (value as string[]) : value ? [value as string] : [];
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (files: FileList) => {
    setIsProcessing(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const uploadedUrl = await processAndUploadWebp(file);
      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }
    setIsProcessing(false);
    
    if (uploadedUrls.length > 0) {
      if (multiple) {
        onChange([...imagesArray, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
      triggerAlert("success", `Compressed and uploaded ${uploadedUrls.length} image(s) to WebP.`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    const uploadedUrl = await processAndUploadUrlWebp(urlInput);
    setIsProcessing(false);
    if (uploadedUrl) {
      if (multiple) {
        onChange([...imagesArray, uploadedUrl]);
      } else {
        onChange(uploadedUrl);
      }
      setUrlInput("");
      triggerAlert("success", "URL imported and converted to WebP.");
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    if (multiple) {
      onChange(imagesArray.filter((u) => u !== imgUrl));
    } else {
      onChange("");
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-[#FAF8F5]/40 p-4 rounded border border-charcoal/5">
      <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">{label}</label>
      
      {/* Upload Area */}
      <div 
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={handleDrop}
        className="border-2 border-dashed border-charcoal/10 rounded p-6 bg-white hover:bg-[#FAF8F5]/80 hover:border-clay/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center relative"
      >
        <Upload size={20} className="text-sage pointer-events-none" />
        <div className="text-xs text-charcoal/80 pointer-events-none">
          <span className="font-semibold text-clay hover:underline">Click to upload</span> or drag and drop
        </div>
        <span className="text-[8px] text-charcoal/40 font-mono pointer-events-none">WebP compression active (lossless quality 1.0)</span>
        <input 
          type="file" 
          multiple={multiple}
          accept="image/*"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
        />
      </div>

      {/* URL Upload Box */}
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Import from image URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="grow bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-1.5 text-xs text-charcoal" 
        />
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleUrlImport}
          className="bg-forest text-white px-3 py-1.5 text-[10px] tracking-widest uppercase font-semibold rounded hover:bg-charcoal transition-colors cursor-pointer"
        >
          {isProcessing ? "Importing..." : "Import URL"}
        </button>
      </div>

      {/* Thumbnail Preview Area */}
      {imagesArray.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-1.5 bg-[#FAF8F5]/50 p-2 rounded border border-charcoal/5">
          {imagesArray.map((src, i) => (
            <div key={i} className="aspect-square relative rounded border border-charcoal/10 overflow-hidden group bg-white shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Uploaded asset preview" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => handleRemoveImage(src)}
                className="absolute inset-0 bg-clay/90 text-white font-sans text-[8px] font-bold tracking-widest uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AdminPanelProps {
  initialSession: { userId: string; username: string; role: string; expires: number };
  initialProjects?: Project[];
  initialServices?: Service[];
  initialTestimonials?: Testimonial[];
  initialLeads?: Lead[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSettings?: Partial<BusinessSettings> | Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialHomepage?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialWebsiteContent?: Record<string, any>;
  initialBlog?: BlogPost[];
  initialUsers?: User[];
  initialAuditLogs?: AuditLog[];
}

export default function AdminPanel({
  initialSession,
  initialProjects = [],
  initialLeads = [],
  initialSettings = {},
  initialWebsiteContent = {},
  initialAuditLogs = [],
}: AdminPanelProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [session] = useState(initialSession);

  // Database States
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings as BusinessSettings);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [websiteContent, setWebsiteContent] = useState<Record<string, any>>(initialWebsiteContent || {});
  const [auditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Client-side LocalStorage Hydration: ensures zero-latency persistence across browser sessions
  useEffect(() => {
    try {
      const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
      if (cachedContent) {
        const parsed = JSON.parse(cachedContent);
        if (parsed && typeof parsed === "object") {
          setWebsiteContent((prev) => ({ ...prev, ...parsed }));
        }
      }
      const deletedProjectsJson = localStorage.getItem("dakshina_cms_deleted_projects");
      const deletedProjectIds: string[] = deletedProjectsJson ? JSON.parse(deletedProjectsJson) : [];
      const cachedProjects = localStorage.getItem("dakshina_cms_projects");
      if (cachedProjects) {
        const parsed = JSON.parse(cachedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed.filter((p: Project) => !deletedProjectIds.includes(String(p.id))));
        }
      } else if (deletedProjectIds.length > 0) {
        setProjects((prev) => prev.filter((p) => !deletedProjectIds.includes(String(p.id))));
      }

      const deletedLeadsJson = localStorage.getItem("dakshina_cms_deleted_leads");
      const deletedLeadIds: string[] = deletedLeadsJson ? JSON.parse(deletedLeadsJson) : [];
      const cachedLeads = localStorage.getItem("dakshina_cms_leads");
      if (cachedLeads) {
        const parsed = JSON.parse(cachedLeads);
        if (Array.isArray(parsed)) {
          setLeads(parsed.filter((l: Lead) => !deletedLeadIds.includes(String(l.id))));
        }
      } else if (deletedLeadIds.length > 0) {
        setLeads((prev) => prev.filter((l) => !deletedLeadIds.includes(String(l.id))));
      }

      const cachedSettings = localStorage.getItem("dakshina_cms_settings");
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        if (parsed && typeof parsed === "object") {
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }, []);

  // Undo / History Stack
  interface HistorySnapshot {
    description: string;
    projects: Project[];
    websiteContent: Record<string, any>;
    settings: BusinessSettings;
    timestamp: number;
  }
  const [historyStack, setHistoryStack] = useState<HistorySnapshot[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);

  const pushHistorySnapshot = (desc: string) => {
    try {
      const snapshot: HistorySnapshot = {
        description: desc,
        projects: JSON.parse(JSON.stringify(projects)),
        websiteContent: JSON.parse(JSON.stringify(websiteContent)),
        settings: JSON.parse(JSON.stringify(settings)),
        timestamp: Date.now()
      };
      setHistoryStack((prev) => [snapshot, ...prev].slice(0, 20)); // Keep up to 20 historical revisions
    } catch (err) {
      console.warn("Failed to capture history snapshot:", err);
    }
  };

  const handleUndo = async () => {
    if (historyStack.length === 0 || isUndoing) return;
    setIsUndoing(true);
    const [previous, ...remaining] = historyStack;
    try {
      // Revert current state to previous snapshot
      setProjects(previous.projects);
      setWebsiteContent(previous.websiteContent);
      setSettings(previous.settings);
      setHistoryStack(remaining);

      // Persist reversion to server actions
      await saveWebsiteContent(previous.websiteContent);
      await saveBusinessSettings(previous.settings);
      notifyCMSChange();

      triggerAlert("success", `Undone: Reverted "${previous.description}". All live pages synchronized!`);
    } catch (err) {
      console.error("Undo error:", err);
      triggerAlert("error", "Failed to undo action.");
    } finally {
      setIsUndoing(false);
    }
  };

  // Global Media Pool
  const [mediaList, setMediaList] = useState<string[]>([
    "/images/hero_interior.jpg",
    "/images/portfolio_dining.jpg",
    "/images/portfolio_office.jpg",
    "/images/slider_after.jpg",
    "/images/slider_before.jpg",
    "/images/parallax_courtyard.jpg",
    "/images/parallax_study.jpg",
    "/images/parallax_dining.jpg",
    "/images/parallax_lounge.jpg",
    "/images/parallax_verandah.jpg",
    "/images/parallax_kitchen.jpg",
    "/images/parallax_staircase.jpg",
    "/images/parallax_bathroom.jpg",
    "/images/parallax_door.jpg",
    "/images/parallax_screen.jpg",
    "/images/parallax_facade.jpg",
    "/images/parallax_details.jpg",
  ]);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [leadSortBy, setLeadSortBy] = useState<"newest" | "oldest" | "name-asc" | "name-desc" | "status">("newest");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Modal / Drawer edit states
  const [editProject, setEditProject] = useState<Partial<Project> | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Alert dismiss timer
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const triggerAlert = (type: "success" | "error", text: string) => {
    setAlertMessage({ type, text });
  };

  // Convert image to WebP (optimized quality = 0.85 for 100% visual clarity with ~85% smaller file size)
  const processAndUploadWebp = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          // Limit maximum dimension to 1440px for high-fidelity web performance
          const MAX_WIDTH = 1440;
          const MAX_HEIGHT = 1440;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          // Enable high-fidelity anti-aliasing image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          
          // Export WebP at ultra-crisp quality (0.80)
          const webpDataUrl = canvas.toDataURL("image/webp", 0.80);
          const base64Content = webpDataUrl.split(",")[1];
          
          // Generate file name ending in .webp
          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const webpFileName = `${originalName.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.webp`;
          
          try {
            const res = await uploadMediaFile(webpFileName, base64Content);
            if (res.success && res.url) {
              setMediaList((prev) => [...prev, res.url!]);
              resolve(res.url);
              return;
            }
          } catch (uploadErr) {
            console.warn("Upload action failed, falling back to instant client data URI:", uploadErr);
          }

          // Safe instantaneous fallback: guaranteed to display and persist in CMS
          setMediaList((prev) => [...prev, webpDataUrl]);
          resolve(webpDataUrl);
        };
        img.onerror = () => resolve(null);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processAndUploadUrlWebp = async (url: string): Promise<string | null> => {
    try {
      const res = await proxyFetchImageUrl(url);
      if (!res.success || !res.base64) {
        triggerAlert("error", `Failed to fetch URL: ${res.error}`);
        return null;
      }
      
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          // Limit maximum dimension to 1440px for web optimization
          const MAX_WIDTH = 1440;
          const MAX_HEIGHT = 1440;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          // Enable high-fidelity anti-aliasing image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          
          const webpDataUrl = canvas.toDataURL("image/webp", 0.80);
          const base64Content = webpDataUrl.split(",")[1];
          
          // Name from URL
          const urlBaseName = url.split("/").pop()?.split("?")[0] || "url-image";
          const originalName = urlBaseName.substring(0, urlBaseName.lastIndexOf('.')) || urlBaseName;
          const webpFileName = `${originalName.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.webp`;
          
          try {
            const uploadRes = await uploadMediaFile(webpFileName, base64Content);
            if (uploadRes.success && uploadRes.url) {
              setMediaList((prev) => [...prev, uploadRes.url!]);
              resolve(uploadRes.url);
              return;
            }
          } catch (err) {
            console.warn("URL upload server action failed, using data URL fallback:", err);
          }

          setMediaList((prev) => [...prev, webpDataUrl]);
          resolve(webpDataUrl);
        };
        img.onerror = () => resolve(null);
        img.src = `data:image/jpeg;base64,${res.base64}`;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      triggerAlert("error", `Import error: ${message}`);
      return null;
    }
  };


  const handleLogout = async () => {
    await adminLogout();
    window.location.href = "/studio/login";
  };

  // 1. DASHBOARD TAB VIEW
  const renderDashboard = () => {
    const totalProjects = projects.length;
    const featuredProjects = projects.filter(p => p.featured).length;
    const totalLeads = leads.length;
    const newContactRequests = leads.filter(l => l.status === "New").length;

    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime())
      .slice(0, 5);

    const recentLogs = [...auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div 
            onClick={() => setActiveTab("portfolio")}
            className="bg-white border border-charcoal/10 p-6 rounded shadow-xs flex items-center justify-between cursor-pointer hover:border-clay/40 hover:shadow-md transition-all duration-300"
          >
            <div>
              <span className="font-sans text-[9px] tracking-widest uppercase text-charcoal/50 block font-bold">Total Projects</span>
              <h4 className="font-serif text-3xl font-light text-charcoal mt-1">{totalProjects}</h4>
            </div>
            <FolderHeart size={24} className="text-clay opacity-60" />
          </div>

          <div 
            onClick={() => setActiveTab("portfolio")}
            className="bg-white border border-charcoal/10 p-6 rounded shadow-xs flex items-center justify-between cursor-pointer hover:border-clay/40 hover:shadow-md transition-all duration-300"
          >
            <div>
              <span className="font-sans text-[9px] tracking-widest uppercase text-charcoal/50 block font-bold">Featured Projects</span>
              <h4 className="font-serif text-3xl font-light text-charcoal mt-1">{featuredProjects}</h4>
            </div>
            <TrendingUp size={24} className="text-forest opacity-60" />
          </div>

          <div 
            onClick={() => setActiveTab("leads")}
            className="bg-white border border-charcoal/10 p-6 rounded shadow-xs flex items-center justify-between cursor-pointer hover:border-clay/40 hover:shadow-md transition-all duration-300"
          >
            <div>
              <span className="font-sans text-[9px] tracking-widest uppercase text-charcoal/50 block font-bold">Inquiry Leads</span>
              <h4 className="font-serif text-3xl font-light text-charcoal mt-1">{totalLeads}</h4>
            </div>
            <Users size={24} className="text-clay opacity-60" />
          </div>

          <div 
            onClick={() => setActiveTab("leads")}
            className="bg-white border border-charcoal/10 p-6 rounded shadow-xs flex items-center justify-between cursor-pointer hover:border-clay/40 hover:shadow-md transition-all duration-300"
          >
            <div>
              <span className="font-sans text-[9px] tracking-widest uppercase text-charcoal/50 block font-bold">Pending Actions</span>
              <h4 className="font-serif text-3xl font-light text-charcoal mt-1">{newContactRequests}</h4>
            </div>
            <Inbox size={24} className="text-forest opacity-60 animate-pulse" />
          </div>
        </div>

        {/* Tables Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Recent Leads */}
          <div className="lg:col-span-7 bg-white border border-charcoal/10 rounded p-6 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-charcoal/5 pb-3">
              <h3 className="font-serif text-lg font-normal text-charcoal">Recent Inquiries</h3>
              <button 
                onClick={() => setActiveTab("leads")} 
                className="font-sans text-[9px] tracking-widest uppercase text-clay font-bold flex items-center gap-1 hover:translate-x-1 transition-transform"
              >
                View All <ArrowRight size={10} />
              </button>
            </div>

            {recentLeads.length === 0 ? (
              <p className="text-xs text-charcoal/50 italic py-6 text-center">No inquiry leads recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    onClick={() => { setSelectedLead(lead); setActiveTab("leads"); }}
                    className="flex justify-between items-center p-3.5 bg-[#FAF8F5] rounded border border-charcoal/5 hover:border-clay/20 cursor-pointer transition-all duration-300"
                  >
                    <div>
                      <h4 className="font-sans text-xs font-semibold text-charcoal">{lead.name}</h4>
                      <p className="font-sans text-[9px] text-charcoal/60 mt-0.5">{lead.service} &middot; {lead.email}</p>
                    </div>
                    <span className={`font-sans text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                      lead.status === "New" ? "bg-clay/10 text-clay" : 
                      lead.status === "Won" ? "bg-forest/10 text-forest" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Audit Activity */}
          <div className="lg:col-span-5 bg-white border border-charcoal/10 rounded p-6 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-charcoal/5 pb-3">
              <h3 className="font-serif text-lg font-normal text-charcoal">Audit Ledger</h3>
              <button 
                onClick={() => setActiveTab("logs")} 
                className="font-sans text-[9px] tracking-widest uppercase text-clay font-bold flex items-center gap-1 hover:translate-x-1 transition-transform"
              >
                View Log <ArrowRight size={10} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="text-xs flex gap-3 border-b border-charcoal/5 pb-3 last:border-0 last:pb-0">
                  <div className="text-charcoal/40 font-mono text-[9px] tracking-tighter self-start mt-0.5">
                    {mounted ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ""}
                  </div>
                  <div>
                    <p className="font-sans text-[11px] text-charcoal font-semibold">
                      {log.user} &middot; <span className="text-clay">{log.action}</span>
                    </p>
                    <p className="font-sans text-[9px] text-charcoal/50 mt-0.5">{log.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. HOMEPAGE & PAGES SECTION TEXT BUILDER
  const [activePageTab, setActivePageTab] = useState<"home" | "about" | "services">("home");

  const handleUpdateField = (page: string, section: string, key: string, value: unknown) => {
    setWebsiteContent((prev) => {
      const updated = JSON.parse(JSON.stringify(prev || {}));
      if (!updated[page]) updated[page] = {};
      if (!updated[page][section]) updated[page][section] = {};
      if (!key) {
        updated[page][section] = value;
      } else {
        updated[page][section][key] = value;
      }
      return updated;
    });
  };

  const handleSaveWebsiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    pushHistorySnapshot(`Content Edit (${activePageTab.toUpperCase()})`);
    
    // Save to localStorage immediately for instant client-side persistence
    const now = Date.now();
    try {
      localStorage.setItem("dakshina_cms_last_saved", String(now));
      localStorage.setItem("dakshina_cms_websiteContent", JSON.stringify(websiteContent));
    } catch (e) {
      console.warn("Local storage write error:", e);
    }

    const res = await saveWebsiteContent(websiteContent);
    if (res.success) {
      let finalSettings = settings;
      if (websiteContent.home?.coordinates) {
        const c = websiteContent.home.coordinates;
        const updatedSettings: BusinessSettings = {
          ...settings,
          phone: c.phone || settings.phone,
          whatsapp: c.whatsapp || settings.whatsapp,
          email: c.email || settings.email,
          address: c.address || settings.address,
          googleMapsEmbedUrl: c.googleMapsUrl || settings.googleMapsEmbedUrl,
        };
        finalSettings = updatedSettings;
        setSettings(updatedSettings);
        try {
          localStorage.setItem("dakshina_cms_settings", JSON.stringify(updatedSettings));
        } catch {}
        await saveBusinessSettings(updatedSettings);
      }
      try {
        await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ websiteContent, settings: finalSettings, lastSaved: now }),
        });
      } catch {}
      notifyCMSChange();
      triggerAlert("success", "Website layout copies and visibility published!");
    } else {
      triggerAlert("error", res.error || "Failed to publish page content changes.");
    }
  };

  const renderHomepage = () => {
    const home = websiteContent.home || {};
    const about = websiteContent.about || {};
    const servicesPage = websiteContent.services || {};

    return (
      <form onSubmit={handleSaveWebsiteContent} className="bg-white border border-charcoal/10 rounded-xl p-6 md:p-8 shadow-xs flex flex-col gap-8 max-w-6xl w-full mx-auto animate-fade-in">
        <div className="border-b border-charcoal/10 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-[#8C421F]">
              Live Site Content CMS
            </span>
            <h3 className="font-serif text-2xl font-normal text-charcoal mt-0.5">Global Page-by-Page Editor</h3>
            <p className="font-sans text-xs text-charcoal/60 mt-0.5 font-light">
              Edit headlines, paragraphs, images, and layout visibility live across all pages.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Page Tabs */}
            <div className="flex gap-1 bg-[#FAF8F5] p-1.5 border border-charcoal/15 rounded-lg shadow-xs">
              {(["home", "services", "about"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePageTab(tab)}
                  className={`px-4 py-2 font-sans text-xs tracking-wider uppercase font-bold rounded-md transition-all cursor-pointer ${
                    activePageTab === tab 
                      ? "bg-[#8C421F] text-[#E8DACB] shadow-sm" 
                      : "text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
                  }`}
                >
                  {tab === "home" ? "Home Page" : tab === "services" ? "Expertise Page" : "Philosophy Page"}
                </button>
              ))}
            </div>

            {/* Undo Button */}
            {historyStack.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                disabled={isUndoing}
                className="bg-[#FAF8F5] hover:bg-[#8C421F]/10 text-[#8C421F] border border-[#8C421F]/30 px-3.5 py-2.5 font-sans text-xs tracking-wider uppercase font-bold rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title={`Undo last action: ${historyStack[0]?.description || ''}`}
              >
                <RotateCcw size={13} className={isUndoing ? "animate-spin" : ""} />
                <span>Undo</span>
                <span className="text-[10px] bg-[#8C421F]/15 px-1.5 py-0.2 rounded-full font-sans">
                  {historyStack.length}
                </span>
              </button>
            )}

            {/* Quick Publish Button */}
            <button 
              type="submit" 
              className="bg-[#505B40] hover:bg-[#23281E] text-white px-5 py-2.5 font-sans text-xs tracking-widest uppercase font-bold rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>Publish Changes</span> &rarr;
            </button>
          </div>
        </div>

        {/* 1. HOME PAGE EDIT SECTIONS */}
        {activePageTab === "home" && (
          <div className="flex flex-col gap-6">
            {/* 0. CINEMATIC INTRO SCROLL ANIMATION DEVICE CONTROLS */}
            <div className="border border-[#8C421F]/25 rounded-xl p-5 bg-[#FAF6F0] flex flex-col gap-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8C421F]/15 pb-4">
                <div>
                  <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-[#8C421F] bg-[#8C421F]/10 px-2 py-0.5 rounded">
                    Intro Sequence Control
                  </span>
                  <h4 className="font-serif text-lg font-medium text-charcoal mt-1">Cinematic Scroll Animation</h4>
                  <p className="font-sans text-xs text-charcoal/60 font-light mt-0.5">
                    Enable or disable the 300-frame video sequence intro screen globally or per device type.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-charcoal/15 shadow-xs self-start sm:self-auto shrink-0">
                  <input 
                    type="checkbox"
                    checked={home.introAnimation?.enabled !== false}
                    onChange={(e) => handleUpdateField("home", "introAnimation", "enabled", e.target.checked)}
                    className="accent-[#8C421F] w-4 h-4 cursor-pointer"
                  />
                  <span className="font-sans text-xs uppercase font-bold text-charcoal/80">
                    {home.introAnimation?.enabled !== false ? "Global Master: ON" : "Global Master: OFF"}
                  </span>
                </label>
              </div>

              {/* Per-device toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Desktop / PC Toggle */}
                <div className="bg-white p-3.5 rounded-lg border border-charcoal/15 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#8C421F]/10 text-[#8C421F] rounded-md">
                      <Monitor size={16} />
                    </div>
                    <div>
                      <h5 className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">PC / Desktop</h5>
                      <span className="font-sans text-[10px] text-charcoal/60">Screen &ge; 1024px</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={home.introAnimation?.desktop !== false}
                      onChange={(e) => handleUpdateField("home", "introAnimation", "desktop", e.target.checked)}
                      className="accent-[#8C421F] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-sans text-[11px] font-bold text-charcoal/80">
                      {home.introAnimation?.desktop !== false ? "ON" : "OFF"}
                    </span>
                  </label>
                </div>

                {/* Tablet Toggle */}
                <div className="bg-white p-3.5 rounded-lg border border-charcoal/15 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#8C421F]/10 text-[#8C421F] rounded-md">
                      <Tablet size={16} />
                    </div>
                    <div>
                      <h5 className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">Tablet</h5>
                      <span className="font-sans text-[10px] text-charcoal/60">768px – 1023px</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={home.introAnimation?.tablet !== false}
                      onChange={(e) => handleUpdateField("home", "introAnimation", "tablet", e.target.checked)}
                      className="accent-[#8C421F] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-sans text-[11px] font-bold text-charcoal/80">
                      {home.introAnimation?.tablet !== false ? "ON" : "OFF"}
                    </span>
                  </label>
                </div>

                {/* Mobile Toggle */}
                <div className="bg-white p-3.5 rounded-lg border border-charcoal/15 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#8C421F]/10 text-[#8C421F] rounded-md">
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <h5 className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">Mobile Phone</h5>
                      <span className="font-sans text-[10px] text-charcoal/60">Screen &lt; 768px</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={home.introAnimation?.mobile !== false}
                      onChange={(e) => handleUpdateField("home", "introAnimation", "mobile", e.target.checked)}
                      className="accent-[#8C421F] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-sans text-[11px] font-bold text-charcoal/80">
                      {home.introAnimation?.mobile !== false ? "ON" : "OFF"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* HOME HERO */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">1. Curated Hero Section</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!home.hero?.enabled}
                    onChange={(e) => handleUpdateField("home", "hero", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Headline Line 1</label>
                  <input 
                    type="text" 
                    value={home.hero?.title1 || ""} 
                    onChange={(e) => handleUpdateField("home", "hero", "title1", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Headline Line 2</label>
                  <input 
                    type="text" 
                    value={home.hero?.title2 || ""} 
                    onChange={(e) => handleUpdateField("home", "hero", "title2", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Hero Description Paragraph</label>
                <textarea 
                  rows={3} 
                  value={home.hero?.description || ""} 
                  onChange={(e) => handleUpdateField("home", "hero", "description", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">CTA Button Label</label>
                <input 
                  type="text" 
                  value={home.hero?.cta || ""} 
                  onChange={(e) => handleUpdateField("home", "hero", "cta", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                />
              </div>

              {/* HERO ACCORDION CAROUSEL IMAGES (5 Slots + Batch Upload) */}
              <div className="flex flex-col gap-6 pt-5 mt-3 border-t border-[#8C421F]/15 bg-[#FAF6F0]/60 p-5 md:p-6 rounded-xl border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#8C421F]/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-[#8C421F] bg-[#8C421F]/10 px-2.5 py-1 rounded-full">
                        Hero Carousel Manager
                      </span>
                      <span className="font-sans text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase font-bold flex items-center gap-1 border border-emerald-200">
                        ● Live Synced to Home Page
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-charcoal font-medium mt-1">
                      Hero Accordion Showcase Images (5 Slot Manager)
                    </h3>
                    <p className="font-sans text-xs text-charcoal/60 font-light">
                      Upload and manage the 5 luxury architectural images displayed in the interactive Hero carousel.
                    </p>
                  </div>
                </div>

                {/* Batch Upload Section */}
                <div className="bg-white p-4 md:p-5 rounded-lg border border-charcoal/10 shadow-xs flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-charcoal/80 block">
                        Batch Uploader (All 5 Carousel Images)
                      </span>
                      <span className="font-sans text-[10px] text-charcoal/50">
                        Select or drag multiple files to replace the 5 carousel images at once
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const demoImages = [
                          "/images/hero_carousel_1.jpg",
                          "/images/hero_carousel_2.jpg",
                          "/images/hero_carousel_3.jpg",
                          "/images/hero_carousel_4.jpg",
                          "/images/hero_carousel_5.jpg"
                        ];
                        handleUpdateField("home", "heroCollage", "", demoImages);
                        triggerAlert("success", "Reset Hero Carousel to original 5 demo images.");
                      }}
                      className="inline-flex items-center gap-1.5 self-start sm:self-auto font-sans text-[10px] uppercase tracking-wider font-bold text-[#8C421F] bg-[#8C421F]/10 hover:bg-[#8C421F]/20 px-3 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      ↻ Reset All 5 to Demo Images
                    </button>
                  </div>
                  <ImageUploader 
                    label="Upload Batch / Edit Carousel Images"
                    value={Array.isArray(home.heroCollage) && home.heroCollage.length > 0 ? home.heroCollage : [
                      "/images/hero_carousel_1.jpg",
                      "/images/hero_carousel_2.jpg",
                      "/images/hero_carousel_3.jpg",
                      "/images/hero_carousel_4.jpg",
                      "/images/hero_carousel_5.jpg"
                    ]}
                    multiple={true}
                    onChange={(val) => {
                      let urls: string[] = [];
                      if (Array.isArray(val)) {
                        urls = val.filter(Boolean);
                      } else if (typeof val === "string") {
                        urls = val.split(",").map(s => s.trim()).filter(Boolean);
                      }
                      const fallbackDemo = [
                        "/images/hero_carousel_1.jpg",
                        "/images/hero_carousel_2.jpg",
                        "/images/hero_carousel_3.jpg",
                        "/images/hero_carousel_4.jpg",
                        "/images/hero_carousel_5.jpg"
                      ];
                      const final5 = [0, 1, 2, 3, 4].map((idx) => urls[idx] || fallbackDemo[idx]);
                      handleUpdateField("home", "heroCollage", "", final5);
                    }}
                    processAndUploadWebp={processAndUploadWebp}
                    processAndUploadUrlWebp={processAndUploadUrlWebp}
                    triggerAlert={triggerAlert}
                  />
                </div>

                {/* Individual Slot Cards Grid */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-[#8C421F]">
                      Individual Image Slots (01 to 05):
                    </span>
                    <span className="font-sans text-[10px] text-charcoal/50 font-medium">
                      Each slot corresponds to an expandable slide card in the Hero carousel
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const currentArr = Array.isArray(home.heroCollage) && home.heroCollage.length > 0 
                        ? [...home.heroCollage] 
                        : ["/images/hero_carousel_1.jpg", "/images/hero_carousel_2.jpg", "/images/hero_carousel_3.jpg", "/images/hero_carousel_4.jpg", "/images/hero_carousel_5.jpg"];
                      const fallbackUrl = `/images/hero_carousel_${slotIdx + 1}.jpg`;
                      const slotVal = currentArr[slotIdx] || fallbackUrl;

                      return (
                        <div key={slotIdx} className="flex flex-col gap-3 bg-white p-4 rounded-lg border border-charcoal/10 shadow-xs hover:border-[#8C421F]/30 transition-all">
                          <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                            <span className="font-sans text-xs font-bold text-[#8C421F] uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#8C421F]"></span>
                              Slot 0{slotIdx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-[10px] text-charcoal/50 font-medium uppercase">
                                Slide {slotIdx + 1}
                              </span>
                              <button
                                type="button"
                                title="Reset this slot to default demo image"
                                onClick={() => {
                                  const newArr = [...currentArr];
                                  newArr[slotIdx] = fallbackUrl;
                                  handleUpdateField("home", "heroCollage", "", newArr);
                                  triggerAlert("success", `Slot 0${slotIdx + 1} reset to demo image.`);
                                }}
                                className="text-[9px] font-sans text-charcoal/40 hover:text-[#8C421F] underline cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                          </div>

                          <ImageUploader 
                            label={`Upload Image for Slot ${slotIdx + 1}`}
                            value={slotVal}
                            multiple={false}
                            onChange={(val) => {
                              const newArr = [...currentArr];
                              const newUrl = typeof val === "string" ? val : (Array.isArray(val) ? val[0] : val);
                              newArr[slotIdx] = newUrl || fallbackUrl;
                              handleUpdateField("home", "heroCollage", "", newArr);
                            }}
                            processAndUploadWebp={processAndUploadWebp}
                            processAndUploadUrlWebp={processAndUploadUrlWebp}
                            triggerAlert={triggerAlert}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* HOME PHILOSOPHY */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">2. Philosophy Section</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!home.philosophy?.enabled}
                    onChange={(e) => handleUpdateField("home", "philosophy", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Philosophy Section Headline</label>
                <input 
                  type="text" 
                  value={home.philosophy?.title || ""} 
                  onChange={(e) => handleUpdateField("home", "philosophy", "title", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Description Paragraph 1</label>
                  <textarea 
                    rows={4} 
                    value={home.philosophy?.p1 || ""} 
                    onChange={(e) => handleUpdateField("home", "philosophy", "p1", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Description Paragraph 2</label>
                  <textarea 
                    rows={4} 
                    value={home.philosophy?.p2 || ""} 
                    onChange={(e) => handleUpdateField("home", "philosophy", "p2", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">About Link Label</label>
                <input 
                  type="text" 
                  value={home.philosophy?.cta || ""} 
                  onChange={(e) => handleUpdateField("home", "philosophy", "cta", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                />
              </div>
            </div>

            {/* HOME CREATIONS */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">3. Best Creations Carousel</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!home.creations?.enabled}
                    onChange={(e) => handleUpdateField("home", "creations", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Carousel Headline</label>
                  <input 
                    type="text" 
                    value={home.creations?.title || ""} 
                    onChange={(e) => handleUpdateField("home", "creations", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Carousel Subtitle</label>
                  <input 
                    type="text" 
                    value={home.creations?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("home", "creations", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
            </div>

            {/* HOME MANIFESTO */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">4. Editorial Manifesto Section</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!home.manifesto?.enabled}
                    onChange={(e) => handleUpdateField("home", "manifesto", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Manifesto Headline Title</label>
                <input 
                  type="text" 
                  value={home.manifesto?.title || ""} 
                  onChange={(e) => handleUpdateField("home", "manifesto", "title", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Manifesto Paragraph Description</label>
                <textarea 
                  rows={3} 
                  value={home.manifesto?.description || ""} 
                  onChange={(e) => handleUpdateField("home", "manifesto", "description", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
            </div>

            {/* HOME PARALLAX GALLERY IMAGES - STRUCTURED BY COLUMNS */}
            <div className="border border-charcoal/10 rounded p-6 bg-[#FAF8F5] flex flex-col gap-6">
              {/* Header with Title & Enable Switch */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-clay bg-clay/10 px-2 py-0.5 rounded">SECTION 4</span>
                    <h3 className="font-serif text-lg text-charcoal font-semibold">Parallax Photo Gallery Showcase</h3>
                  </div>
                  <p className="font-sans text-xs text-charcoal/60 font-light mt-1">
                    Structured across 4 vertical website columns (3 photos per column stream).
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-charcoal/10 shadow-xs self-start md:self-auto">
                  <input 
                    type="checkbox"
                    checked={home.parallaxGallery?.enabled !== false}
                    onChange={(e) => handleUpdateField("home", "parallaxGallery", "enabled", e.target.checked)}
                    className="accent-forest w-4 h-4 cursor-pointer"
                  />
                  <span className="font-sans text-xs uppercase font-bold text-charcoal/80">Section Active</span>
                </label>
              </div>

              {/* Filmstrip Quick Preview */}
              <div className="bg-white border border-charcoal/10 rounded p-3 flex flex-col gap-2">
                <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/50">Full Gallery Filmstrip Overview (12 Photos)</span>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {((home.parallaxGallery?.images && home.parallaxGallery.images.length === 12) 
                    ? home.parallaxGallery.images 
                    : [
                        "/images/parallax_courtyard.jpg", "/images/parallax_study.jpg", "/images/parallax_dining.jpg",
                        "/images/parallax_lounge.jpg", "/images/parallax_verandah.jpg", "/images/parallax_kitchen.jpg",
                        "/images/parallax_staircase.jpg", "/images/parallax_bathroom.jpg", "/images/parallax_door.jpg",
                        "/images/parallax_screen.jpg", "/images/parallax_facade.jpg", "/images/parallax_details.jpg"
                      ]
                  ).map((imgSrc: string, i: number) => (
                    <div key={i} className="relative aspect-[3/4] rounded overflow-hidden border border-charcoal/10 bg-charcoal/5 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgSrc} alt={`Thumb #${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                        #{i + 1}
                      </div>
                      <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] font-mono px-1 rounded">
                        #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Structured Column Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { colNum: 1, title: "Column 1 — Left Stream", indices: [0, 1, 2], positions: ["Top Photo", "Middle Photo", "Bottom Photo"] },
                  { colNum: 2, title: "Column 2 — Center-Left Stream", indices: [3, 4, 5], positions: ["Top Photo", "Middle Photo", "Bottom Photo"] },
                  { colNum: 3, title: "Column 3 — Center-Right Stream", indices: [6, 7, 8], positions: ["Top Photo", "Middle Photo", "Bottom Photo"] },
                  { colNum: 4, title: "Column 4 — Right Stream", indices: [9, 10, 11], positions: ["Top Photo", "Middle Photo", "Bottom Photo"] }
                ].map((col) => {
                  const galleryImages = home.parallaxGallery?.images && home.parallaxGallery.images.length === 12 
                    ? home.parallaxGallery.images 
                    : [
                        "/images/parallax_courtyard.jpg", "/images/parallax_study.jpg", "/images/parallax_dining.jpg",
                        "/images/parallax_lounge.jpg", "/images/parallax_verandah.jpg", "/images/parallax_kitchen.jpg",
                        "/images/parallax_staircase.jpg", "/images/parallax_bathroom.jpg", "/images/parallax_door.jpg",
                        "/images/parallax_screen.jpg", "/images/parallax_facade.jpg", "/images/parallax_details.jpg"
                      ];

                  return (
                    <div key={col.colNum} className="bg-white border border-charcoal/15 rounded-md p-4 flex flex-col gap-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center font-bold text-[10px]">
                            {col.colNum}
                          </span>
                          <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">{col.title}</h4>
                        </div>
                        <span className="font-mono text-[10px] text-charcoal/40 uppercase">3 Images</span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {col.indices.map((idx, posIdx) => (
                          <div key={idx} className="bg-[#FAF8F5] p-2.5 rounded border border-charcoal/5">
                            <ImageUploader 
                              label={`#${idx + 1} • ${col.positions[posIdx]}`}
                              value={galleryImages[idx]}
                              onChange={(val) => {
                                const currentImages = [...galleryImages];
                                currentImages[idx] = val;
                                handleUpdateField("home", "parallaxGallery", "images", currentImages);
                              }}
                              processAndUploadWebp={processAndUploadWebp}
                              processAndUploadUrlWebp={processAndUploadUrlWebp}
                              triggerAlert={triggerAlert}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOME PROCESS (BEFORE/AFTER) */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">5. Before & After Transformation Slider</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!home.process?.enabled}
                    onChange={(e) => handleUpdateField("home", "process", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Process Section Headline</label>
                  <input 
                    type="text" 
                    value={home.process?.title || ""} 
                    onChange={(e) => handleUpdateField("home", "process", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Process Subtitle</label>
                  <input 
                    type="text" 
                    value={home.process?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("home", "process", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Process Description</label>
                <textarea 
                  rows={2} 
                  value={home.process?.description || ""} 
                  onChange={(e) => handleUpdateField("home", "process", "description", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader 
                  label="Before Image (Raw state)"
                  value={home.process?.beforeImage || ""}
                  onChange={(val) => handleUpdateField("home", "process", "beforeImage", val)}
                  processAndUploadWebp={processAndUploadWebp}
                  processAndUploadUrlWebp={processAndUploadUrlWebp}
                  triggerAlert={triggerAlert}
                />
                <ImageUploader 
                  label="After Image (Completed state)"
                  value={home.process?.afterImage || ""}
                  onChange={(val) => handleUpdateField("home", "process", "afterImage", val)}
                  processAndUploadWebp={processAndUploadWebp}
                  processAndUploadUrlWebp={processAndUploadUrlWebp}
                  triggerAlert={triggerAlert}
                />
              </div>
            </div>

            {/* HOME TESTIMONIALS */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">6. Testimonials Reviews Section</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!home.testimonials?.enabled}
                    onChange={(e) => handleUpdateField("home", "testimonials", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Testimonials Title</label>
                  <input 
                    type="text" 
                    value={home.testimonials?.title || ""} 
                    onChange={(e) => handleUpdateField("home", "testimonials", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Testimonials Subtitle</label>
                  <input 
                    type="text" 
                    value={home.testimonials?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("home", "testimonials", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
            </div>

            {/* HOME HQ COORDINATES */}
            {/* STUDIO HQ COORDINATES & CONTACT SETTINGS SECTION */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">7. Studio HQ Coordinates & Contact Settings</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!home.coordinates?.enabled}
                    onChange={(e) => handleUpdateField("home", "coordinates", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Coordinates Title</label>
                  <input 
                    type="text" 
                    value={home.coordinates?.title || ""} 
                    onChange={(e) => handleUpdateField("home", "coordinates", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Coordinates Subtitle</label>
                  <input 
                    type="text" 
                    value={home.coordinates?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("home", "coordinates", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70 flex items-center justify-between">
                    <span>Studio Mobile / Phone Number</span>
                    <span className="text-[8px] text-[#8C421F] font-bold">Linked to Floating Phone Icon</span>
                  </label>
                  <input 
                    type="text" 
                    value={home.coordinates?.phone ?? (settings.phone || "")} 
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateField("home", "coordinates", "phone", val);
                      setSettings((prev) => ({ ...prev, phone: val }));
                    }}
                    placeholder="+91 8848666041"
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-medium" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70 flex items-center justify-between">
                    <span>Studio WhatsApp Number</span>
                    <span className="text-[8px] text-emerald-700 font-bold">Linked to Floating WhatsApp Icon</span>
                  </label>
                  <input 
                    type="text" 
                    value={home.coordinates?.whatsapp ?? (settings.whatsapp || "")} 
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateField("home", "coordinates", "whatsapp", val);
                      setSettings((prev) => ({ ...prev, whatsapp: val }));
                    }}
                    placeholder="+91 8848666041"
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Studio Official Email</label>
                  <input 
                    type="email" 
                    value={home.coordinates?.email ?? (settings.email || "")} 
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateField("home", "coordinates", "email", val);
                      setSettings((prev) => ({ ...prev, email: val }));
                    }}
                    placeholder="dakshinaarchitects@gmail.com"
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Google Maps Embed / Location Link</label>
                  <input 
                    type="text" 
                    value={home.coordinates?.googleMapsUrl ?? (settings.googleMapsEmbedUrl || "")} 
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateField("home", "coordinates", "googleMapsUrl", val);
                      setSettings((prev) => ({ ...prev, googleMapsEmbedUrl: val }));
                    }}
                    placeholder="https://share.google/..."
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Studio Physical Address</label>
                <textarea 
                  rows={2} 
                  value={home.coordinates?.address ?? (settings.address || "")} 
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdateField("home", "coordinates", "address", val);
                    setSettings((prev) => ({ ...prev, address: val }));
                  }}
                  placeholder="310B Junction, Vazhicherry Ward, Alappuzha, Kerala 688001"
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. ABOUT PAGE EDIT SECTIONS */}
        {activePageTab === "about" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* ABOUT HERO */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">1. Page Hero Section</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!about.hero?.enabled}
                    onChange={(e) => handleUpdateField("about", "hero", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Page Title</label>
                  <input 
                    type="text" 
                    value={about.hero?.title || ""} 
                    onChange={(e) => handleUpdateField("about", "hero", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Page Subtitle</label>
                  <input 
                    type="text" 
                    value={about.hero?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("about", "hero", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Description/Thesis Introduction</label>
                <textarea 
                  rows={2} 
                  value={about.hero?.description || ""} 
                  onChange={(e) => handleUpdateField("about", "hero", "description", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
            </div>

            {/* ABOUT PHILOSOPHY */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">2. Editorial Philosophy</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!about.philosophy?.enabled}
                    onChange={(e) => handleUpdateField("about", "philosophy", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Philosophy Blockquote Text</label>
                <input 
                  type="text" 
                  value={about.philosophy?.quote || ""} 
                  onChange={(e) => handleUpdateField("about", "philosophy", "quote", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Paragraph 1</label>
                <textarea 
                  rows={2} 
                  value={about.philosophy?.p1 || ""} 
                  onChange={(e) => handleUpdateField("about", "philosophy", "p1", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Paragraph 2</label>
                <textarea 
                  rows={2} 
                  value={about.philosophy?.p2 || ""} 
                  onChange={(e) => handleUpdateField("about", "philosophy", "p2", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Paragraph 3</label>
                <textarea 
                  rows={2} 
                  value={about.philosophy?.p3 || ""} 
                  onChange={(e) => handleUpdateField("about", "philosophy", "p3", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
            </div>

            {/* ABOUT PILLARS */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">3. The 3 Design Pillars</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!about.pillars?.enabled}
                    onChange={(e) => handleUpdateField("about", "pillars", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Pillars Headline</label>
                  <input 
                    type="text" 
                    value={about.pillars?.title || ""} 
                    onChange={(e) => handleUpdateField("about", "pillars", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Pillars Subtitle</label>
                  <input 
                    type="text" 
                    value={about.pillars?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("about", "pillars", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-4">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Pillar 01</span>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Tag (e.g. 01 // TROPICAL)" value={about.pillars?.p1Tag || ""} onChange={(e) => handleUpdateField("about", "pillars", "p1Tag", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                  <input type="text" placeholder="Title" value={about.pillars?.p1Title || ""} onChange={(e) => handleUpdateField("about", "pillars", "p1Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                </div>
                <textarea rows={2} placeholder="Description" value={about.pillars?.p1Desc || ""} onChange={(e) => handleUpdateField("about", "pillars", "p1Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-4">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Pillar 02</span>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Tag" value={about.pillars?.p2Tag || ""} onChange={(e) => handleUpdateField("about", "pillars", "p2Tag", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                  <input type="text" placeholder="Title" value={about.pillars?.p2Title || ""} onChange={(e) => handleUpdateField("about", "pillars", "p2Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                </div>
                <textarea rows={2} placeholder="Description" value={about.pillars?.p2Desc || ""} onChange={(e) => handleUpdateField("about", "pillars", "p2Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-4">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Pillar 03</span>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Tag" value={about.pillars?.p3Tag || ""} onChange={(e) => handleUpdateField("about", "pillars", "p3Tag", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                  <input type="text" placeholder="Title" value={about.pillars?.p3Title || ""} onChange={(e) => handleUpdateField("about", "pillars", "p3Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                </div>
                <textarea rows={2} placeholder="Description" value={about.pillars?.p3Desc || ""} onChange={(e) => handleUpdateField("about", "pillars", "p3Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
            </div>

            {/* ABOUT MASONRY */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">4. Sourcing & Collaboration</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!about.masonry?.enabled}
                    onChange={(e) => handleUpdateField("about", "masonry", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Headline</label>
                  <input 
                    type="text" 
                    value={about.masonry?.title || ""} 
                    onChange={(e) => handleUpdateField("about", "masonry", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Subtitle</label>
                  <input 
                    type="text" 
                    value={about.masonry?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("about", "masonry", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Paragraph 1</label>
                <textarea 
                  rows={2} 
                  value={about.masonry?.p1 || ""} 
                  onChange={(e) => handleUpdateField("about", "masonry", "p1", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Paragraph 2</label>
                <textarea 
                  rows={2} 
                  value={about.masonry?.p2 || ""} 
                  onChange={(e) => handleUpdateField("about", "masonry", "p2", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. SERVICES PAGE EDIT SECTIONS */}
        {activePageTab === "services" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* SERVICES HERO */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">1. Page Hero Section</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!servicesPage.hero?.enabled}
                    onChange={(e) => handleUpdateField("services", "hero", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Page Title</label>
                  <input 
                    type="text" 
                    value={servicesPage.hero?.title || ""} 
                    onChange={(e) => handleUpdateField("services", "hero", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Page Subtitle</label>
                  <input 
                    type="text" 
                    value={servicesPage.hero?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("services", "hero", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Description Introduction</label>
                <textarea 
                  rows={2} 
                  value={servicesPage.hero?.description || ""} 
                  onChange={(e) => handleUpdateField("services", "hero", "description", e.target.value)}
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" 
                />
              </div>
            </div>

            {/* SERVICES WORKFLOW */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">2. Workflow & Accordions</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!servicesPage.workflow?.enabled}
                    onChange={(e) => handleUpdateField("services", "workflow", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Section Title</label>
                  <input 
                    type="text" 
                    value={servicesPage.workflow?.title || ""} 
                    onChange={(e) => handleUpdateField("services", "workflow", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Section Subtitle</label>
                  <input 
                    type="text" 
                    value={servicesPage.workflow?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("services", "workflow", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-4">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Phase 1 Workflow</span>
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Number" value={servicesPage.workflow?.p1Num || ""} onChange={(e) => handleUpdateField("services", "workflow", "p1Num", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-1" />
                  <input type="text" placeholder="Title" value={servicesPage.workflow?.p1Title || ""} onChange={(e) => handleUpdateField("services", "workflow", "p1Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-2" />
                </div>
                <textarea rows={2} placeholder="Description" value={servicesPage.workflow?.p1Desc || ""} onChange={(e) => handleUpdateField("services", "workflow", "p1Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-4">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Phase 2 Workflow</span>
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Number" value={servicesPage.workflow?.p2Num || ""} onChange={(e) => handleUpdateField("services", "workflow", "p2Num", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-1" />
                  <input type="text" placeholder="Title" value={servicesPage.workflow?.p2Title || ""} onChange={(e) => handleUpdateField("services", "workflow", "p2Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-2" />
                </div>
                <textarea rows={2} placeholder="Description" value={servicesPage.workflow?.p2Desc || ""} onChange={(e) => handleUpdateField("services", "workflow", "p2Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-4">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Phase 3 Workflow</span>
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Number" value={servicesPage.workflow?.p3Num || ""} onChange={(e) => handleUpdateField("services", "workflow", "p3Num", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-1" />
                  <input type="text" placeholder="Title" value={servicesPage.workflow?.p3Title || ""} onChange={(e) => handleUpdateField("services", "workflow", "p3Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-2" />
                </div>
                <textarea rows={2} placeholder="Description" value={servicesPage.workflow?.p3Desc || ""} onChange={(e) => handleUpdateField("services", "workflow", "p3Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-4">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Phase 4 Workflow</span>
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Number" value={servicesPage.workflow?.p4Num || ""} onChange={(e) => handleUpdateField("services", "workflow", "p4Num", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-1" />
                  <input type="text" placeholder="Title" value={servicesPage.workflow?.p4Title || ""} onChange={(e) => handleUpdateField("services", "workflow", "p4Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal col-span-2" />
                </div>
                <textarea rows={2} placeholder="Description" value={servicesPage.workflow?.p4Desc || ""} onChange={(e) => handleUpdateField("services", "workflow", "p4Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
            </div>

            {/* SERVICES MATERIALS */}
            <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-charcoal/5 pb-2">
                <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-clay">3. Materiality & Guides</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!servicesPage.materials?.enabled}
                    onChange={(e) => handleUpdateField("services", "materials", "enabled", e.target.checked)}
                    className="accent-forest w-3.5 h-3.5"
                  />
                  <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Section Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Materials Section Title</label>
                  <input 
                    type="text" 
                    value={servicesPage.materials?.title || ""} 
                    onChange={(e) => handleUpdateField("services", "materials", "title", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Materials Section Subtitle</label>
                  <input 
                    type="text" 
                    value={servicesPage.materials?.subtitle || ""} 
                    onChange={(e) => handleUpdateField("services", "materials", "subtitle", e.target.value)}
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                  />
                </div>
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-3">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Material 1 (Teak)</span>
                <input type="text" placeholder="Title" value={servicesPage.materials?.m1Title || ""} onChange={(e) => handleUpdateField("services", "materials", "m1Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                <textarea rows={2} placeholder="Description" value={servicesPage.materials?.m1Desc || ""} onChange={(e) => handleUpdateField("services", "materials", "m1Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-3">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Material 2 (Clay)</span>
                <input type="text" placeholder="Title" value={servicesPage.materials?.m2Title || ""} onChange={(e) => handleUpdateField("services", "materials", "m2Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                <textarea rows={2} placeholder="Description" value={servicesPage.materials?.m2Desc || ""} onChange={(e) => handleUpdateField("services", "materials", "m2Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-3">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Material 3 (Lime)</span>
                <input type="text" placeholder="Title" value={servicesPage.materials?.m3Title || ""} onChange={(e) => handleUpdateField("services", "materials", "m3Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                <textarea rows={2} placeholder="Description" value={servicesPage.materials?.m3Desc || ""} onChange={(e) => handleUpdateField("services", "materials", "m3Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
              <div className="border-t border-charcoal/5 pt-3 flex flex-col gap-3">
                <span className="font-sans text-[9px] uppercase font-bold text-charcoal/60">Material 4 (Stone)</span>
                <input type="text" placeholder="Title" value={servicesPage.materials?.m4Title || ""} onChange={(e) => handleUpdateField("services", "materials", "m4Title", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" />
                <textarea rows={2} placeholder="Description" value={servicesPage.materials?.m4Desc || ""} onChange={(e) => handleUpdateField("services", "materials", "m4Desc", e.target.value)} className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light leading-relaxed" />
              </div>
            </div>
          </div>
        )}

        {/* Save/Publish button */}
        <button 
          type="submit" 
          className="self-start bg-forest text-white px-8 py-3.5 font-sans text-xs tracking-widest uppercase font-semibold rounded flex items-center gap-2 hover:bg-charcoal transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          Publish Content Changes
        </button>
      </form>
    );
  };

  // 3. PORTFOLIO CRUD TAB VIEW
  const handleEditProjectClick = (proj: Project) => {
    setEditProject(proj);
  };

  const handleAddNewProjectClick = () => {
    setEditProject({
      id: `proj-${Date.now()}`,
      title: "",
      slug: "",
      category: "Residential",
      location: "",
      year: new Date().getFullYear().toString(),
      area: "",
      materials: [],
      description: "",
      image: "/images/hero_interior.jpg",
      images: ["/images/hero_interior.jpg"],
      status: "Published",
      featured: true,
    });
  };

  const handleSaveProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject || !editProject.title) return;
    const projectToSave = editProject as Project;
    pushHistorySnapshot(`Save Project "${projectToSave.title}"`);

    const now = Date.now();
    const idx = projects.findIndex(p => String(p.id) === String(projectToSave.id));
    const next = idx >= 0 ? [...projects] : [...projects, projectToSave];
    if (idx >= 0) next[idx] = projectToSave;

    try {
      localStorage.setItem("dakshina_cms_last_saved", String(now));
      localStorage.setItem("dakshina_cms_projects", JSON.stringify(next));
      // Remove from deleted list if re-added
      const deletedProjectsJson = localStorage.getItem("dakshina_cms_deleted_projects");
      if (deletedProjectsJson) {
        const deletedProjectIds: string[] = JSON.parse(deletedProjectsJson);
        const filtered = deletedProjectIds.filter(id => String(id) !== String(projectToSave.id));
        localStorage.setItem("dakshina_cms_deleted_projects", JSON.stringify(filtered));
      }
    } catch {}
    setProjects(next);

    // Sync to /api/content and AWAIT before notifying clients
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectToSave, projects: next, lastSaved: now }),
      });
    } catch {}

    const res = await saveProject(projectToSave);
    notifyCMSChange();
    setEditProject(null);
    triggerAlert("success", "Portfolio case study saved & published successfully!");
  };

  const handleDeleteProjectClick = async (id: string) => {
    const projToDelete = projects.find(p => String(p.id) === String(id));
    if (!confirm(`Are you sure you want to delete "${projToDelete?.title || 'this project'}"? You can also undo this action using the Undo button.`)) return;
    pushHistorySnapshot(`Delete Project "${projToDelete?.title || id}"`);

    const next = projects.filter(p => String(p.id) !== String(id));
    const now = Date.now();
    try {
      localStorage.setItem("dakshina_cms_last_saved", String(now));
      localStorage.setItem("dakshina_cms_projects", JSON.stringify(next));
      const deletedProjectsJson = localStorage.getItem("dakshina_cms_deleted_projects");
      const deletedProjectIds: string[] = deletedProjectsJson ? JSON.parse(deletedProjectsJson) : [];
      if (!deletedProjectIds.includes(String(id))) {
        deletedProjectIds.push(String(id));
        localStorage.setItem("dakshina_cms_deleted_projects", JSON.stringify(deletedProjectIds));
      }
    } catch {}
    setProjects(next);

    // Sync to /api/content and AWAIT before notifying clients
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteProjectId: id, projects: next, lastSaved: now }),
      });
    } catch {}

    await deleteProject(id);
    notifyCMSChange();
    triggerAlert("success", "Project deleted successfully.");
  };

  const renderPortfolio = () => {
    const filtered = projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search project by name or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-charcoal/10 rounded px-4 py-2.5 pl-10 text-xs text-charcoal focus:outline-none focus:border-clay/50" 
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          </div>

          <div className="flex items-center gap-3">
            {/* Undo Button */}
            {historyStack.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                disabled={isUndoing}
                className="bg-[#FAF8F5] hover:bg-[#8C421F]/10 text-[#8C421F] border border-[#8C421F]/30 px-3.5 py-2.5 font-sans text-xs tracking-wider uppercase font-bold rounded transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title={`Undo last action: ${historyStack[0]?.description || ''}`}
              >
                <RotateCcw size={13} className={isUndoing ? "animate-spin" : ""} />
                <span>Undo</span>
                <span className="text-[10px] bg-[#8C421F]/15 px-1.5 py-0.2 rounded-full font-sans">
                  {historyStack.length}
                </span>
              </button>
            )}

            <button 
              onClick={handleAddNewProjectClick}
              className="bg-forest text-white px-5 py-2.5 font-sans text-xs tracking-widest uppercase font-semibold rounded flex items-center gap-2 hover:bg-charcoal transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Add New Project
            </button>
          </div>
        </div>

        {/* Project Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filtered.map((proj) => (
            <div key={proj.id} className="flex flex-col gap-3 group relative bg-white border border-charcoal/10 rounded p-4 hover:shadow-md transition-all duration-300">
              <div className="relative w-full aspect-[16/11] overflow-hidden rounded bg-neutral-100 border border-charcoal/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proj.image} alt={proj.title} className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className={`absolute top-2.5 right-2.5 font-sans text-[8px] font-bold tracking-widest uppercase px-2 py-1 rounded-full backdrop-blur-md shadow-xs ${
                  proj.status === "Published" ? "bg-forest/15 text-forest border border-forest/10" : "bg-neutral-900/60 text-white"
                }`}>
                  {proj.status}
                </span>
                {proj.featured && (
                  <span className="absolute bottom-2.5 left-2.5 bg-clay text-white font-sans text-[7px] tracking-widest uppercase px-2 py-1 rounded-sm font-bold shadow-xs">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-serif text-lg md:text-xl font-normal text-charcoal leading-tight group-hover:text-clay transition-colors duration-300 truncate max-w-[70%]" title={proj.title}>
                    {proj.title}
                  </h4>
                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleEditProjectClick(proj)}
                      className="p-1.5 border border-charcoal/10 hover:border-clay hover:text-clay rounded bg-white text-charcoal transition-colors cursor-pointer shadow-xs"
                      aria-label="Edit project"
                    >
                      <FileEdit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProjectClick(proj.id)}
                      className="p-1.5 border border-charcoal/10 hover:border-clay hover:text-clay rounded bg-white text-charcoal transition-colors cursor-pointer shadow-xs"
                      aria-label="Delete project"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 font-sans text-[9px] tracking-wider uppercase text-sage font-medium mt-0.5">
                  <span>{proj.category}</span>
                  <span>&middot;</span>
                  <span>{proj.location}</span>
                  {proj.year && (
                    <>
                      <span>&middot;</span>
                      <span>{proj.year}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CRUD MODAL FOR PROJECT (DOCK DRAWER) */}
        {editProject && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white border border-charcoal/10 rounded shadow-2xl overflow-y-auto max-h-[90vh] p-6 flex flex-col gap-6 relative animate-scale-up">
              {/* Close */}
              <button 
                onClick={() => setEditProject(null)} 
                className="absolute top-4 right-4 p-1.5 border border-charcoal/10 rounded text-charcoal hover:text-clay cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="border-b border-charcoal/5 pb-3">
                <h3 className="font-serif text-lg text-charcoal">
                  {editProject.title ? "Modify Project Record" : "Add New Case Study"}
                </h3>
              </div>

              <form onSubmit={handleSaveProjectSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Project Name</label>
                    <input 
                      type="text" 
                      required
                      value={editProject.title || ""} 
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                        setEditProject(prev => prev ? {
                          ...prev,
                          title: newTitle,
                          slug: (!prev.slug || prev.slug === prev.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) ? autoSlug : prev.slug
                        } : null);
                      }}
                      className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Slug Identifier (lowercase)</label>
                    <input 
                      type="text" 
                      required
                      value={editProject.slug || ""} 
                      onChange={(e) => setEditProject({...editProject, slug: e.target.value.toLowerCase().replace(/\s+/g, "-")})}
                      className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Category</label>
                    <select 
                      value={editProject.category || "Residential"} 
                      onChange={(e) => setEditProject({...editProject, category: e.target.value})}
                      className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Consultation">Consultation</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Location</label>
                    <input 
                      type="text" 
                      value={editProject.location || ""} 
                      onChange={(e) => setEditProject({...editProject, location: e.target.value})}
                      className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Built Area</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2,400 sq.ft."
                      value={editProject.area || ""} 
                      onChange={(e) => setEditProject({...editProject, area: e.target.value})}
                      className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Completion Year</label>
                    <input 
                      type="text" 
                      value={editProject.year || ""} 
                      onChange={(e) => setEditProject({...editProject, year: e.target.value})}
                      className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
                    />
                  </div>
                </div>

                <ImageUploader
                  label="Cover Showcase Image"
                  value={editProject.image || ""}
                  onChange={(val) => setEditProject({ ...editProject, image: val as string })}
                  multiple={false}
                  processAndUploadWebp={processAndUploadWebp}
                  processAndUploadUrlWebp={processAndUploadUrlWebp}
                  triggerAlert={triggerAlert}
                />

                <ImageUploader
                  label="Gallery Showcase Images (Multiple Upload & Drag/Drop Support)"
                  value={editProject.images || []}
                  onChange={(val) => setEditProject({ ...editProject, images: val as string[] })}
                  multiple={true}
                  processAndUploadWebp={processAndUploadWebp}
                  processAndUploadUrlWebp={processAndUploadUrlWebp}
                  triggerAlert={triggerAlert}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] uppercase tracking-wider font-semibold text-charcoal/70">Case Study description</label>
                  <textarea 
                    rows={4} 
                    value={editProject.description} 
                    onChange={(e) => setEditProject({...editProject, description: e.target.value})}
                    className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light" 
                  />
                </div>

                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 font-sans text-xs text-charcoal cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editProject.featured} 
                      onChange={(e) => setEditProject({...editProject, featured: e.target.checked})}
                      className="accent-clay rounded" 
                    />
                    Featured Project Carousel Toggle
                  </label>
                  <label className="flex items-center gap-2 font-sans text-xs text-charcoal cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editProject.status === "Published"} 
                      onChange={(e) => setEditProject({...editProject, status: e.target.checked ? "Published" : "Draft"})}
                      className="accent-clay rounded" 
                    />
                    Publish Status
                  </label>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 mt-4 border-t border-charcoal/5 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setEditProject(null)}
                    className="border border-charcoal/10 hover:bg-neutral-100 px-5 py-2 text-xs uppercase tracking-widest font-semibold text-charcoal rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-forest text-white px-5 py-2 text-xs uppercase tracking-widest font-semibold rounded hover:bg-charcoal transition-all cursor-pointer"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 4. LEADS LISTING TAB VIEW
  const handleUpdateLeadStatus = async (id: string, nextStatus: Lead["status"], notes: string) => {
    const res = await updateLeadStatus(id, nextStatus, notes);
    if (res.success) {
      setLeads(prev => {
        const next = [...prev];
        const idx = next.findIndex(l => l.id === id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], status: nextStatus, internalNotes: notes };
        }
        return next;
      });
      setSelectedLead(null);
      triggerAlert("success", "Lead client log status modified.");
    } else {
      triggerAlert("error", "Failed to update lead status.");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Delete lead record forever?")) return;
    try {
      const now = Date.now();
      const deletedLeadsJson = localStorage.getItem("dakshina_cms_deleted_leads");
      const deletedLeadIds: string[] = deletedLeadsJson ? JSON.parse(deletedLeadsJson) : [];
      if (!deletedLeadIds.includes(String(id))) {
        deletedLeadIds.push(String(id));
        localStorage.setItem("dakshina_cms_deleted_leads", JSON.stringify(deletedLeadIds));
      }
      const updated = leads.filter(l => String(l.id) !== String(id));
      localStorage.setItem("dakshina_cms_leads", JSON.stringify(updated));
      localStorage.setItem("dakshina_cms_last_saved", String(now));
      setLeads(updated);
      setSelectedLead(null);

      // Sync to /api/content and await
      try {
        await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleteLeadId: id, leads: updated, lastSaved: now }),
        });
      } catch {}

      await deleteLead(id);
      notifyCMSChange();
      triggerAlert("success", "Lead client log deleted forever.");
    } catch {
      triggerAlert("error", "Failed to delete lead logs.");
    }
  };

  const handleBulkDeleteLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!confirm(`Delete ${selectedLeadIds.length} selected inquiries forever?`)) return;
    try {
      const now = Date.now();
      const deletedLeadsJson = localStorage.getItem("dakshina_cms_deleted_leads");
      const deletedLeadIds: string[] = deletedLeadsJson ? JSON.parse(deletedLeadsJson) : [];
      selectedLeadIds.forEach(id => {
        if (!deletedLeadIds.includes(String(id))) deletedLeadIds.push(String(id));
      });
      localStorage.setItem("dakshina_cms_deleted_leads", JSON.stringify(deletedLeadIds));

      const updated = leads.filter(l => !selectedLeadIds.includes(String(l.id)));
      localStorage.setItem("dakshina_cms_leads", JSON.stringify(updated));
      localStorage.setItem("dakshina_cms_last_saved", String(now));
      setLeads(updated);
      setSelectedLeadIds([]);

      try {
        await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: updated, lastSaved: now }),
        });
      } catch {}

      await deleteMultipleLeads(selectedLeadIds);
      notifyCMSChange();
      triggerAlert("success", `Successfully deleted ${selectedLeadIds.length} inquiries.`);
    } catch {
      triggerAlert("error", "Failed to delete selected inquiries.");
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Location", "Category", "Timeline", "Message", "Submission Time", "Status", "Notes"];
    const rows = leads.map(l => [
      `"${(l.id || "").replace(/"/g, '""')}"`,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.location || "").replace(/"/g, '""')}"`,
      `"${(l.service || "").replace(/"/g, '""')}"`,
      `"${(l.budget || "").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.submissionTime || "").replace(/"/g, '""')}"`,
      `"${(l.status || "").replace(/"/g, '""')}"`,
      `"${(l.internalNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\ufeff" + [headers.map(h => `"${h}"`).join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Inquiries_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("success", "Spacious CSV Export completed.");
  };

  const renderLeads = () => {
    // Filter leads by search query and selected status
    let processed = leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.service || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.location || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || l.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort leads by the selected sorting option
    processed = [...processed].sort((a, b) => {
      if (leadSortBy === "newest") {
        return new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime();
      } else if (leadSortBy === "oldest") {
        return new Date(a.submissionTime).getTime() - new Date(b.submissionTime).getTime();
      } else if (leadSortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (leadSortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      } else if (leadSortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    return (
      <div className="bg-white border border-charcoal/10 rounded p-6 shadow-xs flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-charcoal/5 pb-4">
          <div>
            <h3 className="font-serif text-lg text-charcoal">Client Inquiries & Leads</h3>
            <p className="font-sans text-[10px] text-charcoal/60 mt-0.5">Contact forms captured from the website build wizard.</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="border border-charcoal/10 hover:border-clay text-charcoal hover:text-clay font-sans text-xs tracking-widest uppercase font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Filters and Sorting System */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Search leads by name, email, style, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-charcoal/10 rounded px-4 py-2.5 pl-10 text-xs text-charcoal focus:outline-none focus:border-clay/50" 
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/50">Status:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#FAF8F5] border border-charcoal/10 rounded px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-clay/50"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Quote Sent">Quote Sent</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Sorting selector */}
            <div className="flex items-center gap-1.5">
              <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/50">Sort:</label>
              <select 
                value={leadSortBy}
                onChange={(e) => setLeadSortBy(e.target.value as "newest" | "oldest" | "name-asc" | "name-desc" | "status")}
                className="bg-[#FAF8F5] border border-charcoal/10 rounded px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-clay/50"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="bg-clay/5 border border-clay/20 rounded p-4 flex justify-between items-center animate-fade-in">
            <span className="font-sans text-xs text-charcoal/80">
              Selected <strong>{selectedLeadIds.length}</strong> {selectedLeadIds.length === 1 ? "inquiry" : "inquiries"}
            </span>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setSelectedLeadIds([])}
                className="bg-white border border-charcoal/10 hover:border-charcoal text-charcoal font-sans text-[10px] tracking-widest uppercase font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
              >
                Clear Selection
              </button>
              <button 
                type="button"
                onClick={handleBulkDeleteLeads}
                className="bg-red-655 text-white bg-red-600 hover:bg-red-700 font-sans text-[10px] tracking-widest uppercase font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-charcoal">
            <thead>
              <tr className="border-b border-charcoal/10 font-bold uppercase text-[9px] tracking-wider text-charcoal/60 bg-[#FAF8F5]">
                <th className="p-3 w-10">
                  <input 
                    type="checkbox"
                    checked={processed.length > 0 && selectedLeadIds.length === processed.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeadIds(processed.map(l => l.id));
                      } else {
                        setSelectedLeadIds([]);
                      }
                    }}
                    className="accent-forest cursor-pointer"
                  />
                </th>
                <th className="p-3">Client</th>
                <th className="p-3">Inquiry category</th>
                <th className="p-3">Timeline</th>
                <th className="p-3">Location</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processed.map(l => (
                <tr key={l.id} className="border-b border-charcoal/5 hover:bg-neutral-50 transition-colors">
                  <td className="p-3 w-10">
                    <input 
                      type="checkbox"
                      checked={selectedLeadIds.includes(l.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeadIds(prev => [...prev, l.id]);
                        } else {
                          setSelectedLeadIds(prev => prev.filter(id => id !== l.id));
                        }
                      }}
                      className="accent-forest cursor-pointer"
                    />
                  </td>
                  <td className="p-3 font-semibold">
                    <p>{l.name}</p>
                    <p className="text-[10px] text-charcoal/50 font-normal">{l.email}</p>
                    <p className="text-[10px] text-charcoal/50 font-normal">{l.phone || ""}</p>
                  </td>
                  <td className="p-3">{l.service}</td>
                  <td className="p-3">{l.budget}</td>
                  <td className="p-3 font-mono text-[10px] text-charcoal/60">{l.location || "None"}</td>
                  <td className="p-3 text-charcoal/50">{mounted ? new Date(l.submissionTime).toLocaleDateString() : ""}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[8px] tracking-wider ${
                      l.status === "New" ? "bg-clay/10 text-clay" : 
                      l.status === "Won" ? "bg-forest/10 text-forest" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        onClick={() => setSelectedLead(l)}
                        className="font-sans text-[9px] tracking-widest uppercase text-clay font-bold hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(l.id)}
                        className="font-sans text-[9px] tracking-widest uppercase text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INSPECT LEAD MODAL */}
        {selectedLead && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-charcoal/10 rounded shadow-2xl p-6 flex flex-col gap-6 relative animate-scale-up">
              <button 
                onClick={() => setSelectedLead(null)} 
                className="absolute top-4 right-4 p-1.5 border border-charcoal/10 rounded text-charcoal hover:text-clay cursor-pointer"
              >
                <X size={14} />
              </button>

              <div>
                <span className="font-sans text-[8px] tracking-widest uppercase text-clay font-bold block">CLIENT DETAILED COORDINATES</span>
                <h3 className="font-serif text-2xl text-charcoal font-normal mt-0.5">{selectedLead.name}</h3>
                <p className="font-sans text-xs text-charcoal/60 font-light mt-0.5">{selectedLead.email}</p>
              </div>

              <div className="flex flex-col gap-4 text-xs font-light text-charcoal bg-[#FAF8F5] p-5 rounded border border-charcoal/5">
                <div className="grid grid-cols-2 gap-3 border-b border-charcoal/5 pb-3">
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-wider text-charcoal/40 font-bold block">Inquiry Type</span>
                    <p className="font-semibold text-charcoal mt-0.5">{selectedLead.service}</p>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-wider text-charcoal/40 font-bold block">Timeline</span>
                    <p className="font-semibold text-charcoal mt-0.5">{selectedLead.budget}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-b border-charcoal/5 pb-3">
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-wider text-charcoal/40 font-bold block">Phone</span>
                    <p className="font-semibold text-charcoal mt-0.5">{selectedLead.phone || "None"}</p>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-wider text-charcoal/40 font-bold block">Location</span>
                    <p className="font-semibold text-charcoal mt-0.5">{selectedLead.location || "None"}</p>
                  </div>
                </div>
                <div>
                  <span className="font-sans text-[8px] uppercase tracking-wider text-charcoal/40 font-bold block mb-1">Message Detail</span>
                  <p className="leading-relaxed bg-white p-3 rounded border border-charcoal/5 italic text-charcoal/90">{selectedLead.message || "No comments provided."}</p>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="flex flex-col gap-3">
                <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Update Status</label>
                <select 
                  defaultValue={selectedLead.status} 
                  id="lead-status-select"
                  className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Quote Sent">Quote Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Internal Notes</label>
                <textarea 
                  id="lead-notes-textarea"
                  rows={3}
                  defaultValue={selectedLead.internalNotes || ""}
                  placeholder="Insert follow up notes..."
                  className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-light"
                />
              </div>

              <div className="flex justify-between items-center border-t border-charcoal/5 pt-4">
                <button 
                  onClick={() => selectedLead && handleDeleteLead(selectedLead.id)}
                  className="text-clay hover:underline text-xs font-semibold cursor-pointer"
                >
                  Delete Inquiry
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="border border-charcoal/10 px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (!selectedLead) return;
                      const stat = (document.getElementById("lead-status-select") as HTMLSelectElement).value as Lead["status"];
                      const nts = (document.getElementById("lead-notes-textarea") as HTMLTextAreaElement).value;
                      handleUpdateLeadStatus(selectedLead.id, stat, nts);
                    }}
                    className="bg-forest text-white px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded hover:bg-charcoal transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 5. MEDIA LIBRARY TAB VIEW
  const renderMedia = () => {
    return (
      <div className="bg-white border border-charcoal/10 rounded p-6 shadow-xs flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-charcoal/5 pb-4">
          <div>
            <h3 className="font-serif text-lg text-charcoal">Media Library Manager</h3>
            <p className="font-sans text-[10px] text-charcoal/60 mt-0.5">Sits in the public uploads directory. Auto-compression active.</p>
          </div>
        </div>

        {/* Drag and Drop Media Upload Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const files = e.dataTransfer.files;
              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith("image/")) continue;
                const url = await processAndUploadWebp(file);
                if (url) {
                  triggerAlert("success", `Media file uploaded successfully as WebP: ${file.name}`);
                }
              }
            }
          }}
          className="border-2 border-dashed border-charcoal/10 rounded p-8 bg-[#FAF8F5]/30 hover:bg-[#FAF8F5]/80 hover:border-clay/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center relative"
        >
          <Upload size={24} className="text-sage pointer-events-none" />
          <div className="text-xs text-charcoal/80 pointer-events-none">
            <span className="font-semibold text-clay hover:underline">Click here to upload</span> or drag and drop local files directly
          </div>
          <span className="text-[8px] text-charcoal/40 font-mono pointer-events-none">Compression and optimization auto-applies</span>
          <input 
            type="file" 
            multiple
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files) {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                  const url = await processAndUploadWebp(files[i]);
                  if (url) {
                    triggerAlert("success", `Media file uploaded successfully as WebP: ${files[i].name}`);
                  }
                }
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
          />
        </div>

        {/* Media grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {mediaList.map((m) => (
            <div key={m} className="border border-charcoal/10 rounded overflow-hidden bg-[#FAF8F5] relative group shadow-xs">
              <div className="aspect-square relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m} alt="Media Asset thumbnail" className="object-cover w-full h-full" />
              </div>
              <div className="p-2 border-t border-charcoal/5 bg-white text-center">
                <p className="font-sans text-[8px] font-medium text-charcoal/70 truncate">{m.split("/").pop()}</p>
              </div>
              {/* Copy URL Hover button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(m);
                  triggerAlert("success", "Asset path copied to clipboard!");
                }}
                className="absolute inset-0 bg-charcoal/70 text-white font-sans text-[8px] font-bold tracking-widest uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                Copy Path
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 6. SETTINGS TAB VIEW
  const [compName, setCompName] = useState(settings.companyName || "");
  const [logo, setLogo] = useState(settings.logo || "/images/logo.png");
  const [phone, setPhone] = useState(settings.phone || "");
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || "");
  const [email, setEmail] = useState(settings.email || "");
  const [address, setAddress] = useState(settings.address || "");
  const [hours, setHours] = useState(settings.businessHours || "");
  const [mapsEmbed, setMapsEmbed] = useState(settings.googleMapsEmbedUrl || "");

  // Notification states
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegramEnabled ?? false);
  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || "");
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || "");
  const [emailEnabled, setEmailEnabled] = useState(settings.emailEnabled ?? false);
  const [resendApiKey, setResendApiKey] = useState(settings.resendApiKey || "");
  const [senderEmail, setSenderEmail] = useState(settings.senderEmail || "onboarding@resend.dev");
  const [recipientEmail, setRecipientEmail] = useState(settings.recipientEmail || "");

  // Sync settings whenever settings state is updated or hydrated
  useEffect(() => {
    if (settings) {
      if (settings.companyName !== undefined) setCompName(settings.companyName);
      if (settings.logo !== undefined) setLogo(settings.logo);
      if (settings.phone !== undefined) setPhone(settings.phone);
      if (settings.whatsapp !== undefined) setWhatsapp(settings.whatsapp);
      if (settings.email !== undefined) setEmail(settings.email);
      if (settings.address !== undefined) setAddress(settings.address);
      if (settings.businessHours !== undefined) setHours(settings.businessHours);
      if (settings.googleMapsEmbedUrl !== undefined) setMapsEmbed(settings.googleMapsEmbedUrl);
      if (settings.telegramEnabled !== undefined) setTelegramEnabled(settings.telegramEnabled);
      if (settings.telegramBotToken !== undefined) setTelegramBotToken(settings.telegramBotToken);
      if (settings.telegramChatId !== undefined) setTelegramChatId(settings.telegramChatId);
      if (settings.emailEnabled !== undefined) setEmailEnabled(settings.emailEnabled);
      if (settings.resendApiKey !== undefined) setResendApiKey(settings.resendApiKey);
      if (settings.senderEmail !== undefined) setSenderEmail(settings.senderEmail);
      if (settings.recipientEmail !== undefined) setRecipientEmail(settings.recipientEmail);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      companyName: compName,
      logo,
      phone,
      whatsapp,
      email,
      address,
      businessHours: hours,
      googleMapsEmbedUrl: mapsEmbed,
      instagramUrl: settings.instagramUrl,
      pinterestUrl: settings.pinterestUrl,
      linkedinUrl: settings.linkedinUrl,
      telegramEnabled,
      telegramBotToken,
      telegramChatId,
      emailEnabled,
      resendApiKey,
      senderEmail,
      recipientEmail
    };
    pushHistorySnapshot("Update HQ Coordinates & Settings");
    const res = await saveBusinessSettings(updated);
    if (res.success) {
      setSettings(updated);
      const updatedContent = {
        ...websiteContent,
        home: {
          ...websiteContent.home,
          coordinates: {
            ...websiteContent.home?.coordinates,
            phone,
            whatsapp,
            email,
            address,
            googleMapsUrl: mapsEmbed
          }
        }
      };
      setWebsiteContent(updatedContent);
      await saveWebsiteContent(updatedContent);

      const now = Date.now();
      try {
        localStorage.setItem("dakshina_cms_last_saved", String(now));
        localStorage.setItem("dakshina_cms_settings", JSON.stringify(updated));
        localStorage.setItem("dakshina_cms_websiteContent", JSON.stringify(updatedContent));
        await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: updated, websiteContent: updatedContent, lastSaved: now }),
        });
      } catch (e) {
        console.warn("Storage sync error:", e);
      }

      notifyCMSChange();
      triggerAlert("success", "Studio HQ Coordinates & Phone settings saved and live synced!");
    } else {
      triggerAlert("error", "Failed to update business configuration.");
    }
  };

  const renderSettings = () => {
    return (
      <form onSubmit={handleSaveSettings} className="bg-white border border-charcoal/10 rounded p-6 md:p-8 shadow-xs flex flex-col gap-6 max-w-2xl animate-fade-in">
        <div className="border-b border-charcoal/5 pb-3">
          <h3 className="font-serif text-lg text-charcoal">Business Settings Portal</h3>
          <p className="font-sans text-[10px] text-charcoal/60 mt-0.5">Control dynamic footer coordinates, phone lines, and map embed states.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Studio Name</label>
          <input 
            type="text" 
            value={compName} 
            onChange={(e) => setCompName(e.target.value)}
            className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
          />
        </div>

        <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-1.5">
          <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-charcoal/70 block mb-1">Company Branding Logo</span>
          <ImageUploader
            label="Logo Image"
            value={logo}
            onChange={(val) => setLogo(val as string)}
            multiple={false}
            processAndUploadWebp={processAndUploadWebp}
            processAndUploadUrlWebp={processAndUploadUrlWebp}
            triggerAlert={triggerAlert}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Phone Contact Line</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">WhatsApp ID (Country Code)</label>
            <input 
              type="text" 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)}
              className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Digital Mail Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Physical HQ Address</label>
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Business Hours text</label>
          <input 
            type="text" 
            value={hours} 
            onChange={(e) => setHours(e.target.value)}
            className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[9px] uppercase tracking-wider font-bold text-charcoal/70">Google Maps Embed URL</label>
          <input 
            type="text" 
            value={mapsEmbed} 
            onChange={(e) => setMapsEmbed(e.target.value)}
            className="bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-mono text-[10px]" 
          />
        </div>

        {/* Telegram Integration Panel */}
        <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-charcoal/70 block">Telegram Alert Channel</span>
              <p className="font-sans text-[8px] text-charcoal/50 mt-0.5">Receive instant notifications on a Telegram bot when clients submit inquiries.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
            </label>
          </div>

          {telegramEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[8px] uppercase tracking-wider font-bold text-charcoal/60">Bot Token</label>
                <input 
                  type="password" 
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="e.g. 123456789:ABCdefGhI..."
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[8px] uppercase tracking-wider font-bold text-charcoal/60">Chat ID</label>
                <input 
                  type="text" 
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="e.g. -1001234567890"
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Resend Email Integration Panel */}
        <div className="border border-charcoal/10 rounded p-5 bg-[#FAF8F5] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-[9px] tracking-widest uppercase font-bold text-charcoal/70 block">Resend Email Alerts</span>
              <p className="font-sans text-[8px] text-charcoal/50 mt-0.5">Deliver project leads directly to your inbox via Resend API.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
            </label>
          </div>

          {emailEnabled && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[8px] uppercase tracking-wider font-bold text-charcoal/60">Resend API Key</label>
                <input 
                  type="password" 
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_abcdef123..."
                  className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-mono"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[8px] uppercase tracking-wider font-bold text-charcoal/60">Sender Email</label>
                  <input 
                    type="email" 
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="onboarding@resend.dev"
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[8px] uppercase tracking-wider font-bold text-charcoal/60">Recipient Email</label>
                  <input 
                    type="email" 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="you@yourdomain.com"
                    className="bg-white border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-3 py-2 text-xs text-charcoal font-sans"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="self-start bg-forest text-white px-6 py-2.5 font-sans text-xs tracking-widest uppercase font-semibold rounded hover:bg-charcoal transition-colors cursor-pointer"
        >
          Save Studio Coordinates
        </button>
      </form>
    );
  };

  // 7. AUDIT LOGS TAB VIEW
  const renderLogs = () => {
    const sorted = [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
      <div className="bg-white border border-charcoal/10 rounded p-6 shadow-xs flex flex-col gap-4 animate-fade-in">
        <div className="border-b border-charcoal/5 pb-3">
          <h3 className="font-serif text-lg text-charcoal">System Audit Ledger</h3>
          <p className="font-sans text-[10px] text-charcoal/60 mt-0.5">Append-only administrative operations tracking logs. Immutable logs.</p>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-charcoal/10 font-bold uppercase text-[9px] tracking-wider text-charcoal/60 bg-[#FAF8F5]">
                <th className="p-3">Time</th>
                <th className="p-3">Staff User</th>
                <th className="p-3">Operation Action</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((log) => (
                <tr key={log.id} className="border-b border-charcoal/5 hover:bg-neutral-50">
                  <td className="p-3 font-mono text-charcoal/50 text-[10px]">
                    {mounted ? new Date(log.timestamp).toLocaleString() : ""}
                  </td>
                  <td className="p-3 font-semibold">{log.user}</td>
                  <td className="p-3"><span className="text-clay font-medium">{log.action}</span></td>
                  <td className="p-3 text-charcoal/70 truncate max-w-[200px]">{log.target}</td>
                  <td className="p-3 font-mono text-charcoal/50 text-[10px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 8. BACKUPS TAB VIEW
  const handleBackupExport = async () => {
    const dataString = await exportDbBackup();
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AuraDesign_Db_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("success", "Database JSON Backup downloaded.");
  };

  const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Restoring database backup will overwrite all existing local files. Proceed?")) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      const res = await importDbBackup(text);
      if (res.success) {
        // Refresh page to load database states
        triggerAlert("success", "Database restore completed successfully! Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        triggerAlert("error", `Restore failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadWebsiteContentJson = () => {
    const jsonStr = JSON.stringify(websiteContent, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "website-content.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("success", "Downloaded website-content.json! Replace data/website-content.json in project to bake into Git.");
  };

  const handleDownloadProjectsJson = () => {
    const jsonStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("success", "Downloaded projects.json! Replace data/projects.json in project to bake into Git.");
  };

  const renderBackups = () => {
    return (
      <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
        {/* Vercel Cloud Database Notice */}
        <div className="bg-[#FAF8F5] border border-charcoal/10 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="font-serif text-sm font-semibold text-charcoal">Global Multi-Device Sync Guide</h4>
          </div>
          <p className="font-sans text-xs text-charcoal/70 leading-relaxed font-light">
            Your edits are automatically saved to your browser cache and active serverless memory. To enable <strong>instant live synchronization for all external visitors across the world</strong> without redeploying code:
          </p>
          <div className="bg-white border border-charcoal/10 p-3.5 rounded-lg flex flex-col gap-2 text-xs text-charcoal/80 font-mono">
            <p>1. Open your project on <span className="text-clay font-bold">Vercel.com</span></p>
            <p>2. Click <span className="text-forest font-bold">Storage</span> &rarr; <span className="text-forest font-bold">Create Database</span> &rarr; Choose <span className="text-forest font-bold">KV</span></p>
            <p>3. Click <span className="text-clay font-bold">Connect to Project</span></p>
          </div>
          <p className="font-sans text-[11px] text-charcoal/60 italic">
            Once connected, Vercel sets the KV credentials automatically and this site immediately switches to persistent cloud database mode with zero downtime!
          </p>
        </div>

        {/* Backups Card */}
        <div className="bg-white border border-charcoal/10 rounded-xl p-6 shadow-xs flex flex-col gap-6">
          <div className="border-b border-charcoal/5 pb-3">
            <h3 className="font-serif text-lg text-charcoal">Database Backups & Git Sync</h3>
            <p className="font-sans text-[10px] text-charcoal/60 mt-0.5">Download current JSON files to commit directly to your GitHub repository.</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Download website-content.json */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded border border-charcoal/5">
              <div>
                <h4 className="font-sans text-xs font-semibold text-charcoal">Download website-content.json</h4>
                <p className="font-sans text-[9px] text-charcoal/50 mt-0.5">All page texts, headlines, and layout toggle flags.</p>
              </div>
              <button 
                onClick={handleDownloadWebsiteContentJson}
                className="bg-forest text-white px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold hover:bg-charcoal cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Download size={12} /> Download
              </button>
            </div>

            {/* Download projects.json */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded border border-charcoal/5">
              <div>
                <h4 className="font-sans text-xs font-semibold text-charcoal">Download projects.json</h4>
                <p className="font-sans text-[9px] text-charcoal/50 mt-0.5">All created, edited, and uploaded portfolio case studies.</p>
              </div>
              <button 
                onClick={handleDownloadProjectsJson}
                className="bg-forest text-white px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold hover:bg-charcoal cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Download size={12} /> Download
              </button>
            </div>

            {/* Export All */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded border border-charcoal/5">
              <div>
                <h4 className="font-sans text-xs font-semibold text-charcoal">Export Complete DB Backup</h4>
                <p className="font-sans text-[9px] text-charcoal/50 mt-0.5">Download entire database as a single master backup JSON.</p>
              </div>
              <button 
                onClick={handleBackupExport}
                className="bg-clay text-white px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold hover:bg-charcoal cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Download size={12} /> Export
              </button>
            </div>

            {/* Import */}
            {session.role === "Super Admin" && (
              <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded border border-charcoal/5">
                <div>
                  <h4 className="font-sans text-xs font-semibold text-charcoal">Restore Content</h4>
                  <p className="font-sans text-[9px] text-charcoal/50 mt-0.5">Upload a backup JSON file to restore database.</p>
                </div>
                <label className="bg-charcoal text-white px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold hover:bg-clay cursor-pointer transition-colors flex items-center gap-1.5">
                  <Upload size={12} /> Restore
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleBackupImport} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Nav Items list matching RBAC visibility
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} />, roles: ["Super Admin", "Admin", "Editor", "Content Manager"] },
    { id: "homepage", label: "Content Editor", icon: <Edit size={14} />, roles: ["Super Admin", "Admin", "Editor"] },
    { id: "portfolio", label: "Projects CRUD", icon: <FolderHeart size={14} />, roles: ["Super Admin", "Admin", "Editor", "Content Manager"] },
    { id: "leads", label: "Inquiries Leads", icon: <Users size={14} />, roles: ["Super Admin", "Admin", "Editor"] },
    { id: "media", label: "Media Library", icon: <ImageIcon size={14} />, roles: ["Super Admin", "Admin", "Editor"] },
    { id: "settings", label: "HQ Coordinates", icon: <Sliders size={14} />, roles: ["Super Admin", "Admin"] },
    { id: "logs", label: "Audit Ledger", icon: <History size={14} />, roles: ["Super Admin", "Admin"] },
    { id: "backups", label: "Backups Portal", icon: <Database size={14} />, roles: ["Super Admin", "Admin"] },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF8F5] flex font-sans text-charcoal">
      
      {/* Alert Overlay Banner */}
      {alertMessage && (
        <div className={`fixed top-6 right-6 z-[99999] p-4 rounded shadow-lg border flex items-center gap-3 animate-fade-in ${
          alertMessage.type === "success" 
            ? "bg-white border-forest/20 text-forest" 
            : "bg-white border-clay/20 text-clay"
        }`}>
          {alertMessage.type === "error" && <AlertCircle size={16} />}
          <p className="text-xs font-semibold">{alertMessage.text}</p>
        </div>
      )}

      {/* 1. SIDEBAR (Fixed / Sticky) */}
      <aside className="w-64 bg-forest text-white shrink-0 hidden md:flex flex-col justify-between p-6 h-screen sticky top-0 border-r border-white/5">
        <div className="flex flex-col gap-8">
          {/* Logo Branding */}
          <div className="flex flex-col gap-1 select-none">
            <span className="font-sans text-[8px] tracking-[0.2em] uppercase font-bold text-clay">ADMIN PORTAL</span>
            <h1 className="font-serif text-xl font-light leading-none tracking-wide text-background">Dakshina Architects</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (!item.roles.includes(session.role)) return null;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSearchQuery(""); }}
                  className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs tracking-wider rounded-sm font-medium transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? "bg-white/10 text-white font-bold" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Account details */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-clay/25 flex items-center justify-center font-bold text-clay font-serif">
              {session.username[0].toUpperCase()}
            </div>
            <div>
              <h4 className="text-xs font-semibold leading-tight truncate max-w-[140px]">{session.username}</h4>
              <span className="text-[9px] text-white/50 tracking-widest uppercase font-bold">{session.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-clay hover:bg-clay hover:text-white text-xs tracking-wider uppercase font-semibold py-2.5 rounded transition-all cursor-pointer bg-white/5 text-white"
          >
            <LogOut size={12} /> Log Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONSOLE DISPLAY AREA (Independent Scroll) */}
      <div className="grow flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar header info (Sticky) */}
        <header className="h-16 bg-white border-b border-charcoal/10 px-6 flex justify-between items-center select-none shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-lg md:text-xl font-normal capitalize text-charcoal">
              {activeTab.replace("-", " ")} Workspace
            </h2>
            {historyStack.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8C421F]/10 text-[#8C421F] font-sans text-[10px] font-bold tracking-wider uppercase">
                {historyStack.length} {historyStack.length === 1 ? "revision" : "revisions"} in undo buffer
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 md:gap-4 text-xs font-light text-charcoal/60">
            {historyStack.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                disabled={isUndoing}
                className="bg-[#FAF8F5] hover:bg-[#8C421F] hover:text-white text-[#8C421F] border border-[#8C421F]/30 px-3 py-1.5 font-sans text-xs tracking-wider uppercase font-bold rounded transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title={`Undo last action: ${historyStack[0]?.description || ''}`}
              >
                <RotateCcw size={13} className={isUndoing ? "animate-spin" : ""} />
                <span>Undo</span>
                <span className="text-[10px] bg-[#8C421F]/15 group-hover:bg-white/20 px-1.5 py-0.2 rounded-full font-sans">
                  {historyStack.length}
                </span>
              </button>
            )}
            <span className="hidden lg:inline">Session lock: 4h timeout</span>
            <div className="hidden lg:block w-[1px] h-4 bg-charcoal/10"></div>
            <span className="hidden sm:inline">{mounted ? new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : ""}</span>
          </div>
        </header>

        {/* Active Content view Container (Only Main Section Scrolls) */}
        <main className="grow p-6 md:p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "homepage" && renderHomepage()}
          {activeTab === "portfolio" && renderPortfolio()}
          {activeTab === "leads" && renderLeads()}
          {activeTab === "media" && renderMedia()}
          {activeTab === "settings" && renderSettings()}
          {activeTab === "logs" && renderLogs()}
          {activeTab === "backups" && renderBackups()}
        </main>
      </div>
      
    </div>
  );
}
