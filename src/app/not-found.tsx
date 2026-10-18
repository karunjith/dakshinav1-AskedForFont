import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 py-20 bg-[#FAF8F5]">
      <div className="max-w-md flex flex-col items-center gap-6">
        <span className="font-sans text-xs tracking-[0.3em] uppercase font-bold text-clay bg-clay/10 px-3 py-1 rounded">
          ERROR 404
        </span>
        
        <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal tracking-tight">
          Page Not Found
        </h1>

        <p className="font-sans text-sm text-charcoal/70 font-light leading-relaxed">
          The architectural space or page you are looking for has been relocated or does not exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto bg-forest text-white px-6 py-3 rounded text-xs font-sans font-medium uppercase tracking-widest hover:bg-forest/90 transition-colors shadow-sm"
          >
            Return Home
          </Link>
          <Link
            href="/projects"
            className="w-full sm:w-auto bg-white border border-charcoal/20 text-charcoal px-6 py-3 rounded text-xs font-sans font-medium uppercase tracking-widest hover:bg-charcoal/5 transition-colors"
          >
            View Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
