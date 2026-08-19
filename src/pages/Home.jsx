//src/pages/home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenCheck,
  Users2,
  CalendarCheck2,
  MessagesSquare,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  UserCog,
  Landmark,
  FileText,
  Megaphone,
  Headset,
} from "lucide-react";
import { subscribeToPosts } from "../firebase/posts";
import PostCard from "../components/PostCard";
import heroImage from "../assets/home.png";

const stats = [
  { icon: Users2, label: "Students", value: "15K+" },
  { icon: GraduationCap, label: "Faculty", value: "620+" },
  { icon: BookOpenCheck, label: "Programs", value: "48+" },
  { icon: ShieldCheck, label: "Secure", value: "100%" },
];

// Portal cards-ka hoose ee hero-ga (sida sawirka 1aad) — 6 xagal, mid
// kasta icon + cinwaan + hal xariiq sharaxaad ah.
const portalCards = [
  {
    icon: GraduationCap,
    title: "Student Portal",
    desc: "Access grades, courses, attendance and more.",
  },
  {
    icon: UserCog,
    title: "Faculty Portal",
    desc: "Manage classes, students and academic activities.",
  },
  {
    icon: Landmark,
    title: "Administration",
    desc: "Oversee university operations and management.",
  },
  {
    icon: FileText,
    title: "Academic Records",
    desc: "Secure and centralized academic information.",
  },
  {
    icon: Megaphone,
    title: "News & Updates",
    desc: "Stay informed with the latest announcements.",
  },
  {
    icon: Headset,
    title: "Support Center",
    desc: "Get help and support whenever you need it.",
  },
];

const features = [
  {
    icon: CalendarCheck2,
    title: "Automatic Attendance",
    desc: "Teachers record attendance for each class in one row, while students can instantly view their attendance history.",
  },
  {
    icon: Users2,
    title: "Three Portals",
    desc: "Admin, Teacher, and Student — each user has a dedicated dashboard designed to simplify their tasks.",
  },
  {
    icon: MessagesSquare,
    title: "University Posts",
    desc: "Announcements, photos, and university updates — like, comment, and share with ease.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Data",
    desc: "Student records and attendance data are securely stored in the system, even when the server is online.",
  },
];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // useEffect kan wuxuu xannibayaa right-click, F12, DevTools shortcuts, view-source, iyo save
  useEffect(() => {
    const blockContextMenu = (e) => {
      e.preventDefault();
    };

    const blockKeys = (e) => {
      const key = e.key?.toUpperCase();

      // F12 - furista DevTools
      if (key === "F12") {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I / J / C - DevTools variants (Inspect, Console, Element picker)
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) {
        e.preventDefault();
        return;
      }

      // Ctrl+U - View Page Source
      if (e.ctrlKey && key === "U") {
        e.preventDefault();
        return;
      }

      // Ctrl+S - Save Page
      if (e.ctrlKey && key === "S") {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  useEffect(() => {
    const unsub = subscribeToPosts((data) => {
      setPosts(data.slice(0, 3));
      setLoadingPosts(false);
    });
    return unsub;
  }, []);

  return (
    <div>
      {/* HERO — sida sawirka 1aad: qoraal bidix, sawir dhismaha midig,
          stat cards oo icon leh ku dul-fadhiya sawirka hoostiisa,
          kadibna 6 portal card oo bar-hoose ah. */}
      <section className="relative overflow-hidden bg-navy-700 text-parchment">
        <div className="absolute inset-0 ledger-lines opacity-40" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-seal-radial" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Dhinaca bidix: qoraalka */}
            <div className="text-center lg:text-left">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
                <BookOpenCheck size={14} />
                Modern Academic Records System
              </span>
              <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                IMAM UNIVERSITY —
                <span className="text-gold-400"> .</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg lg:mx-0 mx-auto">
                The university's official digital portal brings together students,
                faculty, administration, and all university services in one secure,
                simple, and efficient system — making academic management easier,
                faster, and more accessible.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-md bg-gold-500 px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lg shadow-gold-900/20 transition-colors hover:bg-gold-400"
                >
                  sign in
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link
                  to="/community"
                  className="flex items-center justify-center gap-2 rounded-md border border-navy-300/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-parchment transition-colors hover:bg-white/10"
                >
                  View Post
                </Link>
              </div>
            </div>

            {/* Dhinaca midig: sawirka dhismaha + stat cards ku dul-fadhiya */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-2xl border border-gold-500/20" />
              <img
                src={heroImage}
                alt="Imam University"
                className="relative w-full rounded-xl object-cover shadow-2xl shadow-navy-900/40"
              />

              <div className="relative -mt-8 grid grid-cols-2 gap-3 px-3 sm:grid-cols-4 sm:px-0">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2.5 rounded-lg border border-navy-400/20 bg-navy-800/95 px-3 py-2.5 shadow-lg backdrop-blur"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                      <s.icon size={15} />
                    </span>
                    <div>
                      <p className="font-display text-sm font-semibold text-gold-300 sm:text-base">
                        {s.value}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-navy-200">
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar-hoose: 6 portal card, sida sawirka 1aad */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:mt-20 lg:grid-cols-6">
            {portalCards.map((c) => (
              <div
                key={c.title}
                className="group rounded-xl border border-navy-400/20 bg-navy-800/60 p-4 text-center transition-colors hover:bg-navy-800"
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy-600 text-gold-400">
                  <c.icon size={18} />
                </span>
                <p className="mt-3 text-sm font-semibold text-parchment">
                  {c.title}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-navy-200">
                  {c.desc}
                </p>
                <span className="mx-auto mt-3 block h-0.5 w-6 bg-gold-500/70" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY PREVIEW — right after the hero, before Features */}
      {(loadingPosts || posts.length > 0) && (
        <section className="bg-navy-50/40 py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-400">
                <MessagesSquare size={18} />
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-700 sm:text-4xl">
                University <span className="text-gold-500">Post</span>
              </h2>
              <p className="mt-2 text-navy-500">
                Latest Announcements & Events
              </p>
            </div>

            {loadingPosts && (
              <p className="mt-10 text-center text-sm text-navy-400">
                Soo dejinaya...
              </p>
            )}

            <div className="mt-10 space-y-5">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} hideActions />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-6 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-navy-600"
              >
                View All Post
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-navy-700 sm:text-4xl">
            Everything You Need in One Place
          </h2>
          <p className="mt-3 text-navy-500">
            A complete system designed to simplify university management and attendance.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-navy-100 bg-white p-7 transition-shadow hover:shadow-lg hover:shadow-navy-900/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-700 text-gold-400">
                <f.icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-navy-800">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="border-y border-gold-800/20 bg-navy-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-parchment sm:text-3xl">
            Diyaar ma u tahay inaad soo gasho?
          </h2>
          <p className="max-w-md text-sm text-navy-200">
            Student, Teacher ama Admin — Student portal-kaaga oo bilow.
          </p>
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-md bg-gold-500 px-7 py-3.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400"
          >
           sign in
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}