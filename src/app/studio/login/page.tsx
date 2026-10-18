import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function AdminLoginPage() {
  const session = await getSession();

  // If already logged in, redirect directly to admin console
  if (session) {
    redirect("/studio");
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-charcoal/10 rounded p-8 shadow-sm">
        {/* Header Branding */}
        <div className="flex flex-col items-center gap-1.5 text-center mb-8 select-none">
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase font-bold text-clay">
            MANAGEMENT CONSOLE
          </span>
          <h1 className="font-serif text-3xl font-light text-charcoal">
            Dakshina Architects
          </h1>
          <p className="font-sans text-[10px] text-charcoal/60 font-light">
            Provide coordinates to access internal systems.
          </p>
        </div>

        {/* Client-side LoginForm Component */}
        <LoginForm />
      </div>
    </main>
  );
}
