import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { readDataFileAsync } from "@/lib/db";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const session = await getSession();

  // If no session exists, redirect to login page (Security Hardening)
  if (!session) {
    redirect("/studio/login");
  }

  // Preload all database tables on the server asynchronously with remote cloud check
  const [
    projects,
    services,
    testimonials,
    leads,
    settings,
    homepage,
    websiteContent,
    blog,
    users,
    auditLogs
  ] = await Promise.all([
    readDataFileAsync("projects.json", []),
    readDataFileAsync("services.json", []),
    readDataFileAsync("testimonials.json", []),
    readDataFileAsync("leads.json", []),
    readDataFileAsync("settings.json", {}),
    readDataFileAsync("homepage.json", {}),
    readDataFileAsync("website-content.json", {}),
    readDataFileAsync("blog.json", []),
    readDataFileAsync("users.json", []),
    readDataFileAsync("audit-logs.json", [])
  ]);

  return (
    <AdminPanel
      initialSession={session}
      initialProjects={projects}
      initialServices={services}
      initialTestimonials={testimonials}
      initialLeads={leads}
      initialSettings={settings}
      initialHomepage={homepage}
      initialWebsiteContent={websiteContent}
      initialBlog={blog}
      initialUsers={users}
      initialAuditLogs={auditLogs}
    />
  );
}
