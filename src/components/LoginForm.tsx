"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { adminLogin } from "@/app/actions/admin";
import { Loader2, KeyRound, User as UserIcon } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await adminLogin(data);
      if (res.success) {
        // Force complete page refresh to reload layouts and cookies
        window.location.assign("/studio");
      } else {
        setError(res.error || "Authentication failed");
        setIsLoading(false);
      }
    } catch {
      setError("An unexpected network error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {error && (
        <div className="bg-clay/10 border border-clay/20 p-4 rounded text-xs text-clay font-medium leading-relaxed">
          {error}
        </div>
      )}

      {/* Username field */}
      <div className="flex flex-col gap-1.5 relative">
        <label htmlFor="username" className="font-sans text-[9px] tracking-widest uppercase font-bold text-charcoal/70">
          Username
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            placeholder="e.g. admin"
            className="w-full bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-4 py-3 pl-10 text-sm text-charcoal font-light transition-colors"
            disabled={isLoading}
            suppressHydrationWarning
            {...register("username")}
          />
          <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
        </div>
        {errors.username && (
          <span className="text-[9px] text-clay font-semibold mt-0.5">{errors.username.message}</span>
        )}
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-1.5 relative">
        <label htmlFor="password" className="font-sans text-[9px] tracking-widest uppercase font-bold text-charcoal/70">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full bg-[#FAF8F5] border border-charcoal/10 focus:border-clay/50 focus:outline-none rounded px-4 py-3 pl-10 text-sm text-charcoal font-light transition-colors"
            disabled={isLoading}
            suppressHydrationWarning
            {...register("password")}
          />
          <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
        </div>
        {errors.password && (
          <span className="text-[9px] text-clay font-semibold mt-0.5">{errors.password.message}</span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-forest text-white py-3.5 px-4 font-sans text-xs tracking-widest uppercase font-semibold rounded flex items-center justify-center gap-2 hover:bg-charcoal active:scale-98 transition-all duration-300 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Authenticating...
          </>
        ) : (
          "Enter Console"
        )}
      </button>
    </form>
  );
}
