import { NextResponse } from "next/server";
import { readDataFileAsync, writeDataFileAsync } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = Boolean(session);

    const projects = await readDataFileAsync<Record<string, unknown>[]>("projects.json", []);
    // Filter out draft projects for public visitors
    const publishedProjects = projects.filter(p => p.status === "Published");

    const leads = isAdmin ? await readDataFileAsync("leads.json", []) : [];
    const services = await readDataFileAsync("services.json", []);
    const testimonials = await readDataFileAsync("testimonials.json", []);
    const rawSettings = await readDataFileAsync<Record<string, unknown>>("settings.json", {});
    const homepage = await readDataFileAsync("homepage.json", {});
    const websiteContent = await readDataFileAsync("website-content.json", {});
    const blog = await readDataFileAsync("blog.json", []);
    const meta = await readDataFileAsync<{ lastSaved?: number }>("sync-meta.json", { lastSaved: 0 });

    // Privacy & Security: Strip API keys and bot tokens for non-admin public requests
    const settings = isAdmin ? rawSettings : {
      companyName: rawSettings.companyName,
      logo: rawSettings.logo,
      phone: rawSettings.phone,
      whatsapp: rawSettings.whatsapp,
      email: rawSettings.email,
      address: rawSettings.address,
      businessHours: rawSettings.businessHours,
      googleMapsEmbedUrl: rawSettings.googleMapsEmbedUrl,
      instagramUrl: rawSettings.instagramUrl,
      pinterestUrl: rawSettings.pinterestUrl,
      linkedinUrl: rawSettings.linkedinUrl,
    };

    return NextResponse.json(
      {
        success: true,
        lastSaved: meta.lastSaved || 0,
        projects: publishedProjects,
        allProjects: isAdmin ? projects : publishedProjects,
        services,
        testimonials,
        leads,
        settings,
        homepage,
        websiteContent,
        blog
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
          "Surrogate-Control": "no-store",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const now = Number(body.lastSaved) || Date.now();
    await writeDataFileAsync("sync-meta.json", { lastSaved: now });

    if (body.websiteContent) {
      await writeDataFileAsync("website-content.json", body.websiteContent);
    }
    if (body.projects) {
      await writeDataFileAsync("projects.json", body.projects);
    }
    if (body.project) {
      const currentProjects = await readDataFileAsync<Record<string, unknown>[]>("projects.json", []);
      const idx = currentProjects.findIndex(p => String(p.id) === String(body.project.id));
      if (idx >= 0) {
        currentProjects[idx] = body.project;
      } else {
        currentProjects.push(body.project);
      }
      await writeDataFileAsync("projects.json", currentProjects);
    }
    if (body.deleteProjectId) {
      const currentProjects = await readDataFileAsync<Record<string, unknown>[]>("projects.json", []);
      const nextProjects = currentProjects.filter(p => String(p.id) !== String(body.deleteProjectId));
      await writeDataFileAsync("projects.json", nextProjects);
    }
    if (body.leads) {
      await writeDataFileAsync("leads.json", body.leads);
    }
    if (body.deleteLeadId) {
      const currentLeads = await readDataFileAsync<Record<string, unknown>[]>("leads.json", []);
      const nextLeads = currentLeads.filter(l => String(l.id) !== String(body.deleteLeadId));
      await writeDataFileAsync("leads.json", nextLeads);
    }
    if (body.settings) {
      await writeDataFileAsync("settings.json", body.settings);
    }

    return NextResponse.json({ success: true, lastSaved: now });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

