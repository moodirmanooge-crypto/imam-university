//src/components/navbar.jsx 
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, Phone, Mail, MessageCircle, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/community", label: "Posts" },
];

// Update these to the university's real contact details.
const CONTACT_EMAIL = "info@imamuniversity.edu.so";
const CONTACT_WHATSAPP = "252611337711"; // digits only, country code, no +

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const navigate = useNavigate();
  const contactRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contactRef.current && !contactRef.current.contains(e.target)) {
        setContactOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const whatsappUrl = `https://wa.me/${CONTACT_WHATSAPP}`;
  const mailtoUrl = `mailto:${CONTACT_EMAIL}`;

  return (
    <header className="sticky top-0 z-50 border-b border-gold-800/40 bg-navy-700/95 backdrop-blur supports-[backdrop-filter]:bg-navy-700/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold-500/60 bg-navy-800">
            <img src={logo} alt="Jaamacadda Imam University" className="h-full w-full object-cover" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-parchment">
            Imam University
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold-500/15 text-gold-300"
                    : "text-navy-100 hover:bg-white/5 hover:text-gold-200"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {/* Contact dropdown */}
          <div className="relative" ref={contactRef}>
            <button
              onClick={() => setContactOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                contactOpen
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-navy-100 hover:bg-white/5 hover:text-gold-200"
              }`}
            >
              <Phone size={14} />
              Contact
              <ChevronDown
                size={14}
                className={`transition-transform ${contactOpen ? "rotate-180" : ""}`}
              />
            </button>

            {contactOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-gold-800/30 bg-navy-800 shadow-2xl">
                <a
                  href={mailtoUrl}
                  onClick={() => setContactOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm text-navy-100 transition-colors hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                    <Mail size={16} />
                  </span>
                  <span>
                    <span className="block font-medium text-parchment">Email</span>
                    <span className="block text-xs text-navy-300">{CONTACT_EMAIL}</span>
                  </span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setContactOpen(false)}
                  className="flex items-center gap-3 border-t border-navy-700 px-4 py-3.5 text-sm text-navy-100 transition-colors hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                    <MessageCircle size={16} />
                  </span>
                  <span>
                    <span className="block font-medium text-parchment">WhatsApp</span>
                    <span className="block text-xs text-navy-300">Ka sii wad wicitaanka</span>
                  </span>
                </a>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:block">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:bg-gold-400"
          >
            <LogIn size={15} strokeWidth={2.5} />
            Sign in
          </button>
        </div>

        <button
          className="text-parchment md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gold-800/40 bg-navy-800 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-gold-500/15 text-gold-300"
                      : "text-navy-100 hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {/* Mobile contact accordion */}
            <button
              onClick={() => setMobileContactOpen((v) => !v)}
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-navy-100 hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <Phone size={14} />
                Contact
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${mobileContactOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileContactOpen && (
              <div className="ml-2 flex flex-col gap-1 border-l border-navy-700 pl-3">
                <a
                  href={mailtoUrl}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-navy-200 hover:bg-white/5"
                >
                  <Mail size={15} className="text-gold-400" />
                  Email
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-navy-200 hover:bg-white/5"
                >
                  <MessageCircle size={15} className="text-sage" />
                  WhatsApp
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setOpen(false);
                navigate("/login");
              }}
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-900"
            >
              <LogIn size={15} strokeWidth={2.5} />
              Sign in
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}