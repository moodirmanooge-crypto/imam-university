import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-navy-900/10 bg-navy-800 text-navy-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/50 text-gold-400">
              <GraduationCap size={16} />
            </span>
            <span className="font-display text-base font-semibold text-parchment">
              University
            </span>
          </div>
          <p className="text-xs text-navy-300">
            © {new Date().getFullYear()} University. Dhammaan xuquuqda way dhowran tahay.
          </p>
        </div>
      </div>
    </footer>
  );
}
