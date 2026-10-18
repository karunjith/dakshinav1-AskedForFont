"use server";

import { revalidatePath } from "next/cache";
import {
  readDataFile,
  writeDataFile,
  readDataFileAsync,
  writeDataFileAsync,
  recordAuditLog,
  Project,
  Service,
  Testimonial,
  Lead,
  BlogPost,
  User,
  BusinessSettings,
  HomepageContent,
  AuditLog
} from "@/lib/db";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  hashPassword,
  createSession,
  destroySession,
  getSession,
  checkRolePermission
} from "@/lib/auth";

// 1. AUTHENTICATION ACTIONS
export async function adminLogin(formData: Record<string, string>) {
  const { username, password } = formData;
  if (!username || !password) {
    return { success: false, error: "Username and password are required" };
  }

  // Artificial constant delay against brute-force timing analysis
  await new Promise((r) => setTimeout(r, 200));

  const users = readDataFile<User[]>("users.json", []);
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return { success: false, error: "Invalid username or password" };
  }

  const hashedInput = hashPassword(password);
  const inputBuffer = Buffer.from(hashedInput, "utf8");
  const storedBuffer = Buffer.from(user.passwordHash, "utf8");
  const isMatch = inputBuffer.length === storedBuffer.length && crypto.timingSafeEqual(inputBuffer, storedBuffer);

  if (!isMatch) {
    recordAuditLog(username, "Failed Login Attempt", `User: ${username}`);
    return { success: false, error: "Invalid username or password" };
  }

  // Create session cookie
  await createSession(user);
  recordAuditLog(user.username, "Successful Login", `User: ${user.name}`);

  return { success: true, user: { name: user.name, role: user.role } };
}

export async function adminLogout() {
  const session = await getSession();
  if (session) {
    recordAuditLog(session.username, "Successful Logout", `User: ${session.username}`);
  }
  await destroySession();
  return { success: true };
}

// 2. DASHBOARD DATA FETCH
export async function getDashboardStats() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const projects = readDataFile<Project[]>("projects.json", []);
  const leads = readDataFile<Lead[]>("leads.json", []);
  const auditLogs = readDataFile<AuditLog[]>("audit-logs.json", []);

  // Filter metrics
  const totalProjects = projects.length;
  const featuredProjects = projects.filter(p => p.featured).length;
  const totalLeads = leads.length;
  const newContactRequests = leads.filter(l => l.status === "New").length;

  // Sort items
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime())
    .slice(0, 5);

  const recentActivity = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return {
    totalProjects,
    featuredProjects,
    totalLeads,
    newContactRequests,
    recentLeads,
    recentActivity,
  };
}

// 3. HOMEPAGE MANAGEMENT
export async function saveHomepage(data: HomepageContent) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const success = writeDataFile<HomepageContent>("homepage.json", data);
  if (success) {
    recordAuditLog(session.username, "Update Homepage Content", "Homepage Section");
    revalidatePath("/");
  }
  return { success };
}

// 4. PORTFOLIO MANAGEMENT (CRUD)
export async function saveProject(project: Project) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor", "Content Manager"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const projects = await readDataFileAsync<Project[]>("projects.json", []);
  const existingIdx = projects.findIndex(p => String(p.id) === String(project.id));

  if (existingIdx >= 0) {
    projects[existingIdx] = project;
    recordAuditLog(session.username, "Modify Project", `Project: ${project.title}`);
  } else {
    projects.push(project);
    recordAuditLog(session.username, "Create Project", `Project: ${project.title}`);
  }

  const success = await writeDataFileAsync<Project[]>("projects.json", projects);
  if (success) {
    revalidatePath("/");
    revalidatePath("/projects");
  }
  return { success };
}

export async function deleteProject(id: string) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const projects = await readDataFileAsync<Project[]>("projects.json", []);
  const project = projects.find(p => String(p.id) === String(id));
  if (!project) return { success: false, error: "Project not found" };

  const nextProjects = projects.filter(p => String(p.id) !== String(id));
  const success = await writeDataFileAsync<Project[]>("projects.json", nextProjects);
  if (success) {
    recordAuditLog(session.username, "Delete Project", `Project ID: ${id} (${project.title})`);
    revalidatePath("/");
    revalidatePath("/projects");
  }
  return { success };
}

// 5. SERVICES MANAGEMENT (CRUD)
export async function saveService(service: Service) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const services = readDataFile<Service[]>("services.json", []);
  const existingIdx = services.findIndex(s => s.id === service.id);

  if (existingIdx >= 0) {
    services[existingIdx] = service;
    recordAuditLog(session.username, "Modify Service", `Service: ${service.title}`);
  } else {
    services.push(service);
    recordAuditLog(session.username, "Create Service", `Service: ${service.title}`);
  }

  const success = writeDataFile<Service[]>("services.json", services);
  if (success) {
    revalidatePath("/services");
  }
  return { success };
}

export async function deleteService(id: string) {
  const session = await checkRolePermission(["Super Admin", "Admin"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const services = readDataFile<Service[]>("services.json", []);
  const service = services.find(s => s.id === id);
  if (!service) return { success: false, error: "Service not found" };

  const nextServices = services.filter(s => s.id !== id);
  const success = writeDataFile<Service[]>("services.json", nextServices);
  if (success) {
    recordAuditLog(session.username, "Delete Service", `Service ID: ${id} (${service.title})`);
    revalidatePath("/services");
  }
  return { success };
}

// 6. TESTIMONIALS MANAGEMENT (CRUD)
export async function saveTestimonial(testi: Testimonial) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor", "Content Manager"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const testimonials = readDataFile<Testimonial[]>("testimonials.json", []);
  const existingIdx = testimonials.findIndex(t => t.id === testi.id);

  if (existingIdx >= 0) {
    testimonials[existingIdx] = testi;
    recordAuditLog(session.username, "Modify Testimonial", `Client: ${testi.clientName}`);
  } else {
    testimonials.push(testi);
    recordAuditLog(session.username, "Create Testimonial", `Client: ${testi.clientName}`);
  }

  const success = writeDataFile<Testimonial[]>("testimonials.json", testimonials);
  if (success) {
    revalidatePath("/");
  }
  return { success };
}

export async function deleteTestimonial(id: string) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const testimonials = readDataFile<Testimonial[]>("testimonials.json", []);
  const testi = testimonials.find(t => t.id === id);
  if (!testi) return { success: false, error: "Testimonial not found" };

  const nextTestimonials = testimonials.filter(t => t.id !== id);
  const success = writeDataFile<Testimonial[]>("testimonials.json", nextTestimonials);
  if (success) {
    recordAuditLog(session.username, "Delete Testimonial", `Client ID: ${id} (${testi.clientName})`);
    revalidatePath("/");
  }
  return { success };
}

// 7. BLOG MANAGEMENT (CRUD)
export async function saveBlogPost(post: BlogPost) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor", "Content Manager"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const posts = readDataFile<BlogPost[]>("blog.json", []);
  const existingIdx = posts.findIndex(p => p.id === post.id);

  if (existingIdx >= 0) {
    posts[existingIdx] = post;
    recordAuditLog(session.username, "Modify Blog Post", `Post: ${post.title}`);
  } else {
    posts.push(post);
    recordAuditLog(session.username, "Create Blog Post", `Post: ${post.title}`);
  }

  const success = writeDataFile<BlogPost[]>("blog.json", posts);
  return { success };
}

export async function deleteBlogPost(id: string) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const posts = readDataFile<BlogPost[]>("blog.json", []);
  const post = posts.find(p => p.id === id);
  if (!post) return { success: false, error: "Blog post not found" };

  const nextPosts = posts.filter(p => p.id !== id);
  const success = writeDataFile<BlogPost[]>("blog.json", nextPosts);
  if (success) {
    recordAuditLog(session.username, "Delete Blog Post", `Post ID: ${id} (${post.title})`);
  }
  return { success };
}

// 8. CONTACT MANAGEMENT (LEADS CRUD & PUBLIC INGESTION)
export async function updateLeadStatus(id: string, status: Lead["status"], notes?: string) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const leads = readDataFile<Lead[]>("leads.json", []);
  const existingIdx = leads.findIndex(l => l.id === id);
  if (existingIdx === -1) return { success: false, error: "Lead not found" };

  leads[existingIdx].status = status;
  if (notes !== undefined) {
    leads[existingIdx].internalNotes = notes;
  }

  const success = writeDataFile<Lead[]>("leads.json", leads);
  if (success) {
    recordAuditLog(session.username, "Modify Lead Status", `Lead ID: ${id} (${status})`);
  }
  return { success };
}

export async function deleteLead(id: string) {
  const session = await checkRolePermission(["Super Admin", "Admin"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const leads = readDataFile<Lead[]>("leads.json", []);
  const nextLeads = leads.filter(l => l.id !== id);
  const success = writeDataFile<Lead[]>("leads.json", nextLeads);
  if (success) {
    recordAuditLog(session.username, "Delete Lead Record", `Lead ID: ${id}`);
  }
  return { success };
}

export async function deleteMultipleLeads(ids: string[]) {
  const session = await checkRolePermission(["Super Admin", "Admin"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const leads = readDataFile<Lead[]>("leads.json", []);
  const nextLeads = leads.filter(l => !ids.includes(l.id));
  const success = writeDataFile<Lead[]>("leads.json", nextLeads);
  if (success) {
    recordAuditLog(session.username, "Bulk Delete Leads", `Deleted Lead IDs count: ${ids.length}`);
  }
  return { success };
}

// Helper to send email and Telegram notifications for new inquiry leads
async function sendInquiryNotifications(lead: Lead) {
  try {
    const settings = await readDataFileAsync<Record<string, unknown>>("settings.json", {});

    // 1. Telegram Notification Integration
    if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
      const messageText = `
New Dakshina Architects Inquiry!

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || "None"}
Location: ${lead.location || "None"}
Service Type: ${lead.service || "None"}
Date: ${new Date(lead.submissionTime).toISOString().split('T')[0]}
Details: ${lead.message || "None"}
      `.trim();

      await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: messageText
        }),
      });
    }

    // 2. Resend Email Integration
    if (settings.emailEnabled && settings.resendApiKey && settings.recipientEmail && settings.senderEmail) {
      const { Resend } = await import("resend");
      const resendClient = new Resend(settings.resendApiKey as string);

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #23281E; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">New Project Inquiry</h2>
          <p>A client has submitted a new inquiry lead on the Dakshina Architects website:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Client Name:</td>
              <td style="padding: 8px 0;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone Number:</td>
              <td style="padding: 8px 0;"><a href="tel:${lead.phone}">${lead.phone}</a></td>
            </tr>
            ${lead.whatsapp ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">WhatsApp:</td>
              <td style="padding: 8px 0;">${lead.whatsapp}</td>
            </tr>` : ""}
            ${lead.service ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Service Type:</td>
              <td style="padding: 8px 0;">${lead.service}</td>
            </tr>` : ""}
            ${lead.budget ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Budget:</td>
              <td style="padding: 8px 0;">${lead.budget}</td>
            </tr>` : ""}
            ${lead.message ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 8px 0; line-height: 1.5;">${lead.message}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Submitted At:</td>
              <td style="padding: 8px 0;">${new Date(lead.submissionTime).toLocaleString()}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding-top: 15px; border-top: 1px solid #eaeaea; font-size: 11px; color: #888888;">
            Sent automatically from Dakshina Architects Web Portal.
          </div>
        </div>
      `;

      await resendClient.emails.send({
        from: settings.senderEmail as string,
        to: settings.recipientEmail as string,
        subject: `[Dakshina Architects] New Project Inquiry from ${lead.name}`,
        html: htmlBody,
      });
    }
  } catch (err) {
    console.error("Error sending inquiry notifications:", err);
  }
}

// Public Ingestion Action (Used on Contact page submission)
export async function submitContactForm(data: Omit<Lead, "id" | "submissionTime" | "status" | "internalNotes">) {
  const cleanName = String(data.name || "").trim().slice(0, 100);
  const cleanEmail = String(data.email || "").trim().slice(0, 150);
  const cleanPhone = String(data.phone || "").trim().slice(0, 30);
  const cleanLocation = String(data.location || "").trim().slice(0, 100);
  const cleanMessage = String(data.message || "").trim().slice(0, 4000);
  const cleanService = String(data.service || "").trim().slice(0, 100);
  const cleanBudget = String(data.budget || "").trim().slice(0, 100);

  if (!cleanName || (!cleanEmail && !cleanPhone)) {
    return { success: false, error: "Please provide your name and contact details." };
  }

  const leads = await readDataFileAsync<Lead[]>("leads.json", []);
  const newLead: Lead = {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    location: cleanLocation,
    message: cleanMessage,
    service: cleanService,
    budget: cleanBudget,
    id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    submissionTime: new Date().toISOString(),
    status: "New"
  };
  leads.push(newLead);
  const success = await writeDataFileAsync<Lead[]>("leads.json", leads);

  if (success) {
    // Send background notifications
    await sendInquiryNotifications(newLead);
  }

  return { success };
}

// 9. USER SETTINGS & RBAC (CRUD)
export async function saveUserAccount(user: User) {
  const session = await checkRolePermission(["Super Admin", "Admin"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const users = readDataFile<User[]>("users.json", []);
  const existingIdx = users.findIndex(u => u.id === user.id);

  if (existingIdx >= 0) {
    users[existingIdx] = user;
    recordAuditLog(session.username, "Modify User Account", `User: ${user.username}`);
  } else {
    users.push(user);
    recordAuditLog(session.username, "Create User Account", `User: ${user.username}`);
  }

  const success = writeDataFile<User[]>("users.json", users);
  return { success };
}

export async function deleteUserAccount(id: string) {
  const session = await checkRolePermission(["Super Admin"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const users = readDataFile<User[]>("users.json", []);
  const user = users.find(u => u.id === id);
  if (!user) return { success: false, error: "User not found" };

  if (user.role === "Super Admin" && users.filter(u => u.role === "Super Admin").length <= 1) {
    return { success: false, error: "Cannot delete the final Super Admin account" };
  }

  const nextUsers = users.filter(u => u.id !== id);
  const success = writeDataFile<User[]>("users.json", nextUsers);
  if (success) {
    recordAuditLog(session.username, "Delete User Account", `User ID: ${id} (${user.username})`);
  }
  return { success };
}

// 10. BUSINESS CONFIG SETTINGS
export async function saveBusinessSettings(data: BusinessSettings) {
  const session = await checkRolePermission(["Super Admin", "Admin"]);
  if (!session) return { success: false, error: "Unauthorized" };

  const success = await writeDataFileAsync<BusinessSettings>("settings.json", data);
  if (success) {
    recordAuditLog(session.username, "Modify Business Settings", "Settings Portal");
    revalidatePath("/contact");
  }
  return { success };
}

// 11. BACKUPS & DATA EXPORTS
export async function exportDbBackup() {
  const session = await checkRolePermission(["Super Admin", "Admin"]);
  if (!session) throw new Error("Unauthorized");

  const projects = readDataFile("projects.json", []);
  const services = readDataFile("services.json", []);
  const testimonials = readDataFile("testimonials.json", []);
  const leads = readDataFile("leads.json", []);
  const settings = readDataFile("settings.json", {});
  const homepage = readDataFile("homepage.json", {});
  const blog = readDataFile("blog.json", []);

  recordAuditLog(session.username, "Manual Database Export", "Backups Portal");

  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    projects,
    services,
    testimonials,
    leads,
    settings,
    homepage,
    blog
  }, null, 2);
}

export async function importDbBackup(jsonString: string) {
  const session = await checkRolePermission(["Super Admin"]);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const data = JSON.parse(jsonString);
    if (!data.projects || !data.services || !data.testimonials) {
      return { success: false, error: "Invalid backup format: missing tables" };
    }

    writeDataFile("projects.json", data.projects);
    writeDataFile("services.json", data.services);
    writeDataFile("testimonials.json", data.testimonials);
    if (data.leads) writeDataFile("leads.json", data.leads);
    if (data.settings) writeDataFile("settings.json", data.settings);
    if (data.homepage) writeDataFile("homepage.json", data.homepage);
    if (data.blog) writeDataFile("blog.json", data.blog);

    recordAuditLog(session.username, "Restore Database from Backup", "Backups Portal");
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/services");
    revalidatePath("/contact");

    return { success: true };
  } catch {
    return { success: false, error: "Malformed backup content" };
  }
}

export async function uploadMediaFile(fileName: string, base64Data: string) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    const safeFileName = path.basename(fileName).replace(/[^a-zA-Z0-9_.-]/g, "");
    if (!safeFileName) throw new Error("Invalid filename");

    try {
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(path.join(publicUploadsDir, safeFileName), buffer);
      recordAuditLog(session.username, "Upload Media File", `File: ${safeFileName}`);
      return { success: true, url: `/uploads/${safeFileName}` };
    } catch {
      // Serverless fallback: return data URI so image immediately displays and saves in CMS
      const dataUri = `data:image/webp;base64,${base64Data}`;
      recordAuditLog(session.username, "Upload Media File (Data URI)", `File: ${safeFileName}`);
      return { success: true, url: dataUri };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to write media asset";
    return { success: false, error: message };
  }
}

// 13. WEBSITE CONTENT & LAYOUT CONTROLS
export async function getWebsiteContent() {
  try {
    const data = readDataFile<Record<string, unknown>>("website-content.json", {});
    return { success: true, content: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch content";
    return { success: false, error: message };
  }
}

export async function saveWebsiteContent(content: Record<string, unknown>) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await writeDataFileAsync("website-content.json", content);
    recordAuditLog(session.username, "Update Website Content", "Updated page-by-page texts and layout settings");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/services");
    revalidatePath("/projects");
    revalidatePath("/contact");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save content";
    return { success: false, error: message };
  }
}

export async function proxyFetchImageUrl(url: string) {
  const session = await checkRolePermission(["Super Admin", "Admin", "Editor"]);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // SSRF Hardening: restrict request protocols to http/https
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("Invalid URL protocol scheme. Use http or https.");
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const base64 = buffer.toString("base64");
    return { success: true, base64: `data:${mimeType};base64,${base64}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to proxy image";
    return { success: false, error: message };
  }
}
