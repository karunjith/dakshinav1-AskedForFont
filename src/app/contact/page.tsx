"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { gsap } from "gsap";
import { Home, Briefcase, Hammer, MessageSquare, ArrowLeft, CheckCircle2, MapPin, Phone, Mail } from "lucide-react";
import { trackContactSubmit } from "@/lib/analytics";
import { submitContactForm } from "@/app/actions/admin";

// Form schema definition with Zod (Requirement 11: replaced aesthetic with timeline, added location)
const formSchema = z.object({
  projectType: z.string().min(1, "Please select a project category"),
  aestheticTheme: z.string().min(1, "Please select a project timeline"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TypeOption {
  value: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

interface ThemeOption {
  value: string;
  label: string;
  desc: string;
  tagline: string;
}

export default function Contact() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState<string>("+91 88486 66041");
  const [email, setEmail] = useState<string>("dakshinaarchitects@gmail.com");
  const [address, setAddress] = useState<string>("310B Junction, Vazhicherry Ward, Alappuzha, Kerala – 688001");
  const [mapsUrl, setMapsUrl] = useState<string>("https://share.google/QaStKz2hYxyXAL90j");

  useEffect(() => {
    const hydrateLocal = () => {
      try {
        const cachedSettings = localStorage.getItem("dakshina_cms_settings");
        if (cachedSettings) {
          const parsed = JSON.parse(cachedSettings);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.googleMapsEmbedUrl) setMapsUrl(parsed.googleMapsEmbedUrl);
        }
        const cachedContent = localStorage.getItem("dakshina_cms_websiteContent");
        if (cachedContent) {
          const coords = JSON.parse(cachedContent)?.home?.coordinates;
          if (coords) {
            if (coords.phone) setPhone(coords.phone);
            if (coords.email) setEmail(coords.email);
            if (coords.address) setAddress(coords.address);
            if (coords.googleMapsUrl) setMapsUrl(coords.googleMapsUrl);
          }
        }
      } catch {}
    };

    // 0. Immediate LocalStorage Hydration
    hydrateLocal();

    const fetchContactDetails = async () => {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const localLastSaved = Number(localStorage.getItem("dakshina_cms_last_saved") || "0");
            const serverLastSaved = Number(data.lastSaved || "0");
            const isServerFresh = serverLastSaved >= localLastSaved || !localLastSaved;

            if (isServerFresh) {
              const settings = data?.settings || {};
              const coords = data?.websiteContent?.home?.coordinates || data?.content?.home?.coordinates || {};

              const activePhone = coords.phone || settings.phone || "+91 88486 66041";
              const activeEmail = coords.email || settings.email || "dakshinaarchitects@gmail.com";
              const activeAddress = coords.address || settings.address || "310B Junction, Vazhicherry Ward, Alappuzha, Kerala – 688001";
              const activeMaps = coords.googleMapsUrl || settings.googleMapsEmbedUrl || "https://share.google/QaStKz2hYxyXAL90j";

              setPhone(activePhone);
              setEmail(activeEmail);
              setAddress(activeAddress);
              setMapsUrl(activeMaps);

              try {
                if (data.settings) localStorage.setItem("dakshina_cms_settings", JSON.stringify(data.settings));
                if (data.websiteContent) localStorage.setItem("dakshina_cms_websiteContent", JSON.stringify(data.websiteContent));
              } catch {}
            } else {
              hydrateLocal();
            }
          }
        }
      } catch (err) {
        console.error("Failed to load contact details:", err);
      }
    };

    fetchContactDetails();

    const handleReload = () => {
      hydrateLocal();
      fetchContactDetails();
    };
    window.addEventListener("cms_reload_content", handleReload);
    window.addEventListener("storage", handleReload);
    return () => {
      window.removeEventListener("cms_reload_content", handleReload);
      window.removeEventListener("storage", handleReload);
    };
  }, []);

  // Initialize React Hook Form
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: "",
      aestheticTheme: "",
      name: "",
      email: "",
      phone: "",
      location: "",
      message: ""
    },
    mode: "onChange"
  });

  // Watch state values
  const watchedType = watch("projectType");
  const watchedTheme = watch("aestheticTheme");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedLocation = watch("location");

  // Initial title entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo("#contact-subtitle", 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 }
      ).fromTo("#contact-title", 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.3"
      ).fromTo("#wizard-box", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
    });

    return () => ctx.revert();
  }, []);

  // Animate step transitions
  useEffect(() => {
    if (submitted) return;
    gsap.fromTo("#step-content", 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, [currentStep, submitted]);

  const typeOptions: TypeOption[] = [
    {
      value: "Residential",
      label: "Residential",
      desc: "Villas & courtyard homes",
      icon: <Home size={18} />
    },
    {
      value: "Commercial",
      label: "Commercial",
      desc: "Workspace, offices, studios",
      icon: <Briefcase size={18} />
    },
    {
      value: "Restoration",
      label: "Restoration",
      desc: "Heritage Nalukettu upgrades",
      icon: <Hammer size={18} />
    },
    {
      value: "Consultation",
      label: "Consultation",
      desc: "Layout planning advisory",
      icon: <MessageSquare size={18} />
    }
  ];

  // Design Theme Options cards (Timeline instead of Aesthetic)
  const themeOptions: ThemeOption[] = [
    {
      value: "Immediate",
      label: "Immediate Start",
      desc: "Ready to initiate layout planning and construction within the next 30 days.",
      tagline: "URGENT BUILD"
    },
    {
      value: "Next 3 Months",
      label: "Within 3 months",
      desc: "In structural design or blueprint phase, building within 90 days.",
      tagline: "SHORT TERM"
    },
    {
      value: "Next 6 Months",
      label: "Within 6 months",
      desc: "Acquiring property, site preparation, or in financial planning phase.",
      tagline: "LONG TERM"
    },
    {
      value: "Flexible",
      label: "Flexible Schedule",
      desc: "Advisory only, planning conceptual layouts, or checking compliance.",
      tagline: "CONCEPT ONLY"
    }
  ];

  const selectProjectType = (val: string) => {
    setValue("projectType", val, { shouldValidate: true });
    setTimeout(() => {
      setCurrentStep(2);
    }, 250);
  };

  const selectAestheticTheme = (val: string) => {
    setValue("aestheticTheme", val, { shouldValidate: true });
    setTimeout(() => {
      setCurrentStep(3);
    }, 250);
  };

  const onSubmit = async (data: FormData) => {
    trackContactSubmit(data.projectType, data.aestheticTheme);
    try {
      await submitContactForm({
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        whatsapp: "",
        service: data.projectType,
        budget: data.aestheticTheme,
        message: data.message || "",
        sourcePage: "contact"
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit lead:", error);
    }
  };

  const resetWizard = () => {
    setValue("projectType", "");
    setValue("aestheticTheme", "");
    setValue("name", "");
    setValue("email", "");
    setValue("phone", "");
    setValue("location", "");
    setValue("message", "");
    setCurrentStep(1);
    setSubmitted(false);
  };

  return (
    <main className="pt-36 bg-background min-h-screen">
      {/* 1. Page Hero */}
      <section className="pb-8 mb-12 border-b border-charcoal/10 container">
        <span id="contact-subtitle" className="font-sans text-xs tracking-widest uppercase text-clay mb-2.5 block font-semibold">
          Inquiry Portal
        </span>
        <h1 id="contact-title" className="text-4xl md:text-6xl font-light leading-none tracking-tight text-charcoal">
          Start a Build.
        </h1>
      </section>

      {/* 2. Form Wizard Component */}
      <section className="container mb-24">
        <div 
          id="wizard-box" 
          className="w-full max-w-[680px] mx-auto bg-white border border-charcoal/15 p-6 md:p-12 rounded shadow-xs"
        >
          
          {submitted ? (
            /* Submission Success Panel */
            <div className="flex flex-col gap-5 text-center items-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#8C421F]/15 border border-[#8C421F]/30 flex items-center justify-center text-[#8C421F] mb-2 shadow-xs">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="font-serif text-3xl text-charcoal font-normal leading-tight">Inquiry Received.</h2>
              <p className="text-sm opacity-85 leading-relaxed max-w-md font-light text-charcoal">
                We have registered your project request for a <strong className="font-semibold text-[#8C421F]">{watchedType}</strong> design scheduled on an <strong className="font-semibold text-[#8C421F]">{watchedTheme}</strong> timeline. A Dakshina Architects team member will reach out to you at <strong className="font-semibold text-[#8C421F]">{watchedEmail}</strong> (or via phone) within 24 hours to schedule a consultation call.
              </p>
              <button 
                className="bg-[#8C421F] text-[#E8DACB] px-8 py-3.5 font-sans text-xs tracking-widest uppercase rounded-full hover:bg-[#B66C48] transition-all transform hover:-translate-y-0.5 mt-4 cursor-pointer font-semibold shadow-md" 
                onClick={resetWizard}
              >
                Inquire For Another Project
              </button>
            </div>
          ) : (
            /* Wizard Steps */
            <>
              {/* Step indicator tracker */}
              <div className="flex justify-between items-center pb-4 border-b border-charcoal/5 mb-10">
                <span className="font-sans text-[10px] tracking-widest uppercase text-sage font-semibold">Step {currentStep} of 7</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div 
                      key={s} 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep >= s ? "bg-clay" : "bg-neutral-200"}`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Transition Wrapper */}
              <div id="step-content">
                
                {/* STEP 1: PROJECT CATEGORY */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="font-serif text-2xl font-normal text-charcoal mb-6">Select Project Type</h3>
                    <div className="grid grid-cols-2 gap-3.5 sm:gap-4 mb-6">
                      {typeOptions.map((opt) => (
                        <div 
                          key={opt.value}
                          className={`border p-4 sm:p-6 rounded-2xl flex flex-col items-center text-center gap-2.5 sm:gap-3 cursor-pointer transition-all duration-300 active:scale-95 touch-manipulation select-none shadow-xs ${
                            watchedType === opt.value 
                              ? "border-[#8C421F] bg-[#8C421F]/10 shadow-md ring-1 ring-[#8C421F]" 
                              : "border-[#8C421F]/20 bg-[#FDFBF7] hover:border-[#8C421F]/60 hover:bg-[#8C421F]/5"
                          }`}
                          onClick={() => selectProjectType(opt.value)}
                        >
                          <div className={`transition-colors duration-300 ${watchedType === opt.value ? "text-[#8C421F]" : "text-[#505B40]"}`}>
                            {opt.icon}
                          </div>
                          <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-[#23281E]">
                            {opt.label}
                          </span>
                          <p className="text-[10px] text-[#23281E]/70 leading-normal font-light hidden sm:block">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: PROJECT TIMELINE */}
                {currentStep === 2 && (
                  <div>
                    <h3 className="font-serif text-2xl font-normal text-charcoal mb-6">Select Project Timeline</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-8">
                      {themeOptions.map((opt) => (
                        <div 
                          key={opt.value}
                          className={`border p-4 sm:p-6 rounded-2xl flex flex-col items-start text-left gap-2 cursor-pointer transition-all duration-300 active:scale-95 touch-manipulation select-none shadow-xs ${
                            watchedTheme === opt.value 
                              ? "border-[#8C421F] bg-[#8C421F]/10 shadow-md ring-1 ring-[#8C421F]" 
                              : "border-[#8C421F]/20 bg-[#FDFBF7] hover:border-[#8C421F]/60 hover:bg-[#8C421F]/5"
                          }`}
                          onClick={() => selectAestheticTheme(opt.value)}
                        >
                          <span className="font-sans text-[9px] tracking-wider uppercase font-bold text-[#8C421F]">{opt.tagline}</span>
                          <span className="font-serif text-base font-normal text-[#23281E]">{opt.label}</span>
                          <p className="text-[11px] text-[#23281E]/70 leading-normal font-light mt-0.5">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button 
                        type="button" 
                        className="font-sans text-[10px] tracking-widest uppercase text-sage hover:text-clay cursor-pointer flex items-center gap-1.5 transition-colors font-semibold"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: NAME CARD */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-serif text-2xl font-normal text-charcoal">What is your name?</h3>
                    <div className="flex flex-col relative mt-2">
                      <input 
                        type="text" 
                        id="name"
                        autoFocus
                        placeholder=" "
                        className="bg-transparent border-b border-charcoal/20 py-3 text-sm focus:outline-none focus:border-clay text-charcoal font-light peer" 
                        {...register("name")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && watchedName.length >= 2) {
                            e.preventDefault();
                            setCurrentStep(4);
                          }
                        }}
                      />
                      <label 
                        htmlFor="name" 
                        className="absolute left-0 top-3 font-sans text-xs tracking-widest uppercase text-charcoal opacity-50 pointer-events-none transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:opacity-50 peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:opacity-80 peer-focus:text-clay peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:opacity-80 peer-not-placeholder-shown:text-clay"
                      >
                        Your Full Name
                      </label>
                      {errors.name && (
                        <span className="text-[10px] text-clay mt-1.5 font-medium">{errors.name.message}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button 
                        type="button" 
                        className="font-sans text-[10px] tracking-widest uppercase text-sage hover:text-clay cursor-pointer flex items-center gap-1.5 transition-colors font-semibold"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button 
                        type="button" 
                        className="bg-[#8C421F] text-[#E8DACB] px-8 py-3.5 font-sans text-xs tracking-widest uppercase rounded-full hover:bg-[#B66C48] transition-all transform hover:-translate-y-0.5 disabled:bg-neutral-300/50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:transform-none cursor-pointer font-semibold shadow-md"
                        disabled={!watchedName || watchedName.length < 2}
                        onClick={() => setCurrentStep(4)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: EMAIL CARD */}
                {currentStep === 4 && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-serif text-2xl font-normal text-charcoal">What is your email address?</h3>
                    <div className="flex flex-col relative mt-2">
                      <input 
                        type="email" 
                        id="email"
                        autoFocus
                        placeholder=" "
                        className="bg-transparent border-b border-charcoal/20 py-3 text-base focus:outline-none focus:border-clay text-charcoal font-light peer" 
                        {...register("email")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && watchedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedEmail)) {
                            e.preventDefault();
                            setCurrentStep(5);
                          }
                        }}
                      />
                      <label 
                        htmlFor="email" 
                        className="absolute left-0 top-3 font-sans text-xs tracking-widest uppercase text-charcoal opacity-50 pointer-events-none transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:opacity-50 peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:opacity-80 peer-focus:text-clay peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:opacity-80 peer-not-placeholder-shown:text-clay"
                      >
                        Email Address
                      </label>
                      {errors.email && (
                        <span className="text-[10px] text-clay mt-1.5 font-medium">{errors.email.message}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button 
                        type="button" 
                        className="font-sans text-[10px] tracking-widest uppercase text-sage hover:text-clay cursor-pointer flex items-center gap-1.5 transition-colors font-semibold"
                        onClick={() => setCurrentStep(3)}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button 
                        type="button" 
                        className="bg-[#8C421F] text-[#E8DACB] px-8 py-3.5 font-sans text-xs tracking-widest uppercase rounded-full hover:bg-[#B66C48] transition-all transform hover:-translate-y-0.5 disabled:bg-neutral-300/50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:transform-none cursor-pointer font-semibold shadow-md"
                        disabled={!watchedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedEmail)}
                        onClick={() => setCurrentStep(5)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: PHONE NUMBER CARD */}
                {currentStep === 5 && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-serif text-2xl font-normal text-charcoal">What is your phone number?</h3>
                    <div className="flex flex-col relative mt-2">
                      <input 
                        type="tel" 
                        id="phone"
                        autoFocus
                        placeholder=" "
                        className="bg-transparent border-b border-charcoal/20 py-3 text-base focus:outline-none focus:border-clay text-charcoal font-light peer" 
                        {...register("phone")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && watchedPhone.length >= 10) {
                            e.preventDefault();
                            setCurrentStep(6);
                          }
                        }}
                      />
                      <label 
                        htmlFor="phone" 
                        className="absolute left-0 top-3 font-sans text-xs tracking-widest uppercase text-charcoal opacity-50 pointer-events-none transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:opacity-50 peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:opacity-80 peer-focus:text-clay peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:opacity-80 peer-not-placeholder-shown:text-clay"
                      >
                        Phone Number
                      </label>
                      {errors.phone && (
                        <span className="text-[10px] text-clay mt-1.5 font-medium">{errors.phone.message}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button 
                        type="button" 
                        className="font-sans text-[10px] tracking-widest uppercase text-sage hover:text-clay cursor-pointer flex items-center gap-1.5 transition-colors font-semibold"
                        onClick={() => setCurrentStep(4)}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button 
                        type="button" 
                        className="bg-[#8C421F] text-[#E8DACB] px-8 py-3.5 font-sans text-xs tracking-widest uppercase rounded-full hover:bg-[#B66C48] transition-all transform hover:-translate-y-0.5 disabled:bg-neutral-300/50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:transform-none cursor-pointer font-semibold shadow-md"
                        disabled={!watchedPhone || watchedPhone.length < 10}
                        onClick={() => setCurrentStep(6)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: LOCATION CARD */}
                {currentStep === 6 && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-serif text-2xl font-normal text-charcoal">Where is the project located?</h3>
                    <div className="flex flex-col relative mt-2">
                      <input 
                        type="text" 
                        id="location"
                        autoFocus
                        placeholder=" "
                        className="bg-transparent border-b border-charcoal/20 py-3 text-sm focus:outline-none focus:border-clay text-charcoal font-light peer" 
                        {...register("location")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && watchedLocation.length >= 2) {
                            e.preventDefault();
                            setCurrentStep(7);
                          }
                        }}
                      />
                      <label 
                        htmlFor="location" 
                        className="absolute left-0 top-3 font-sans text-xs tracking-widest uppercase text-charcoal opacity-50 pointer-events-none transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:opacity-50 peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:opacity-80 peer-focus:text-clay peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:opacity-80 peer-not-placeholder-shown:text-clay"
                      >
                        City / Location (e.g. Alappuzha, Kochi)
                      </label>
                      {errors.location && (
                        <span className="text-[10px] text-clay mt-1.5 font-medium">{errors.location.message}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button 
                        type="button" 
                        className="font-sans text-[10px] tracking-widest uppercase text-sage hover:text-clay cursor-pointer flex items-center gap-1.5 transition-colors font-semibold"
                        onClick={() => setCurrentStep(5)}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button 
                        type="button" 
                        className="bg-[#8C421F] text-[#E8DACB] px-8 py-3.5 font-sans text-xs tracking-widest uppercase rounded-full hover:bg-[#B66C48] transition-all transform hover:-translate-y-0.5 disabled:bg-neutral-300/50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:transform-none cursor-pointer font-semibold shadow-md"
                        disabled={!watchedLocation || watchedLocation.length < 2}
                        onClick={() => setCurrentStep(7)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 7: DETAILS & SUBMIT CARD */}
                {currentStep === 7 && (
                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <h3 className="font-serif text-2xl font-normal text-charcoal mb-2">Any other details we should know?</h3>

                    {/* Summary coordinates checklist block */}
                    <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#8C421F]/25 shadow-xs mb-4">
                      <span className="font-sans text-[10px] tracking-widest uppercase text-[#8C421F] font-bold block mb-3">
                        YOUR PROJECT SUMMARY
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
                        <div className="bg-white/90 p-3.5 rounded-xl border border-charcoal/15 flex flex-col justify-center">
                          <span className="text-[#8C421F] uppercase text-[10px] tracking-wider font-bold mb-0.5">Category:</span>
                          <span className="font-semibold text-charcoal text-sm">{watchedType || "Residential"}</span>
                        </div>
                        <div className="bg-white/90 p-3.5 rounded-xl border border-charcoal/15 flex flex-col justify-center">
                          <span className="text-[#8C421F] uppercase text-[10px] tracking-wider font-bold mb-0.5">Timeline:</span>
                          <span className="font-semibold text-charcoal text-sm">{watchedTheme || "Next 3 Months"}</span>
                        </div>
                        <div className="bg-white/90 p-3.5 rounded-xl border border-charcoal/15 flex flex-col justify-center">
                          <span className="text-[#8C421F] uppercase text-[10px] tracking-wider font-bold mb-0.5">Name:</span>
                          <span className="font-semibold text-charcoal text-sm">{watchedName || "Karunjith P"}</span>
                        </div>
                        <div className="bg-white/90 p-3.5 rounded-xl border border-charcoal/15 flex flex-col justify-center">
                          <span className="text-[#8C421F] uppercase text-[10px] tracking-wider font-bold mb-0.5">Location:</span>
                          <span className="font-semibold text-charcoal text-sm">{watchedLocation || "Ohio"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col relative">
                      <input 
                        type="text" 
                        id="message"
                        autoFocus
                        placeholder=" "
                        className="bg-transparent border-b border-charcoal/20 py-3 text-sm focus:outline-none focus:border-clay text-charcoal font-light peer" 
                        {...register("message")}
                      />
                      <label 
                        htmlFor="message" 
                        className="absolute left-0 top-3 font-sans text-xs tracking-widest uppercase text-charcoal opacity-50 pointer-events-none transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:opacity-50 peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:opacity-80 peer-focus:text-clay peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:opacity-80 peer-not-placeholder-shown:text-clay"
                      >
                        Describe your build or location details (optional)
                      </label>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <button 
                        type="button" 
                        className="font-sans text-[10px] tracking-widest uppercase text-sage hover:text-clay cursor-pointer flex items-center gap-1.5 transition-colors font-semibold"
                        onClick={() => setCurrentStep(6)}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button 
                        type="submit" 
                        className="bg-[#8C421F] text-[#E8DACB] px-8 py-3.5 font-sans text-xs tracking-widest uppercase rounded-full hover:bg-[#B66C48] transition-all transform hover:-translate-y-0.5 cursor-pointer font-semibold shadow-md"
                      >
                        Submit Inquiry
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </>
          )}

        </div>
      </section>

      {/* 3. Studio Coordinates & Interactive Map */}
      <section className="py-24 border-t border-charcoal/5 bg-white/40">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Studio Coordinates */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <span className="font-sans text-xs tracking-widest uppercase text-clay mb-2.5 block font-semibold">
                HQ Coordinates
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight text-charcoal">
                Visit the Studio.
              </h2>
            </div>
            
            <div className="flex flex-col gap-5 mt-2 font-sans text-sm text-charcoal/80 font-light">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-clay shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-0.5">Physical HQ</h4>
                  <p>{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone size={18} className="text-clay shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-0.5">Phone Line</h4>
                  <p className="hover:text-clay transition-colors">
                    <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail size={18} className="text-clay shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-0.5">Digital Mail</h4>
                  <p className="hover:text-clay transition-colors">
                    <a href={`mailto:${email}`}>{email}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Google Map with Direct Link Button */}
          <div className="lg:col-span-7 w-full aspect-16/10 bg-neutral-100 rounded-2xl overflow-hidden shadow-sm border border-charcoal/15 relative group">
            <iframe 
              src={mapsUrl.includes("embed") ? mapsUrl : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.4385966601614!2d76.32626071478952!3d9.501584293183576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0884d5dfd17887%3A0xe96c4d7ec6a6d65c!2sVazhicherry%20Ward%2C%20Alappuzha%2C%20Kerala%20688001!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy"
              title="Dakshina Architects Google Maps Location"
            ></iframe>

            <div className="absolute bottom-4 right-4 z-10">
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#23281E] text-white px-5 py-3 rounded-full font-sans text-xs tracking-widest uppercase font-bold flex items-center gap-2 hover:bg-[#8C421F] active:scale-95 transition-all shadow-lg touch-manipulation"
              >
                Open Studio on Google Maps &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
