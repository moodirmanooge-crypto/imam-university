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
} from "lucide-react";
import { subscribeToPosts } from "../firebase/posts";
import PostCard from "../components/PostCard";

const stats = [
  { label: "Kuliyado", value: "6" },
  { label: "Qaybo", value: "24" },
  { label: "Students diiwaangashan", value: "3,200+" },
];

const features = [
  {
    icon: CalendarCheck2,
    title: "Xaadirinta Toos ah",
    desc: "Teachers ayaa fasal walba ku duubaya xaadirinta hal saf, Studentguna wuxuu si degdeg ah u arkaa taariikhdiisa.",
  },
  {
    icon: Users2,
    title: "Saddex Portal",
    desc: "Admin, Teacher iyo Student — mid kasta wuxuu leeyahay dashboard u gaar ah oo la simplify garaacay.",
  },
  {
    icon: MessagesSquare,
    title: "Post Jaamacadda",
    desc: "Ogeysiisyada, sawirada iyo dhacdooyinka jaamacadda — like, comment iyo share si toos ah.",
  },
  {
    icon: ShieldCheck,
    title: "Xogta Sugan",
    desc: "Diiwaanka Studentga iyo xaadirintiisu waxay ku kaydsan yihiin nidaam ammaan leh oo server omline  ku shaqeeya.",
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
      {/* HERO — ledger / seal motif */}
      <section className="relative overflow-hidden bg-navy-700 text-parchment">
        <div className="absolute inset-0 ledger-lines opacity-40" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-seal-radial" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
              <BookOpenCheck size={14} />
              Diiwaanka Tacliinta ee Casriga ah
            </span>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              IMAM UNIVERSITY —
              <span className="text-gold-400"> .</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
              Portal-ka rasmiga ah ee jaamacadda: Ardayda, macallimiinta, maamulka iyo adeegyada jaamacadda dhammaantood waxay ku midoobaan hal nidaam — si fudud, degdeg ah, oo casri ah.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
                Eeg Post
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 divide-x divide-navy-400/20 border-y border-navy-400/20 py-6">
            {stats.map((s) => (
              <div key={s.label} className="px-4 text-center">
                <p className="font-display text-2xl font-semibold text-gold-300 sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-navy-200 sm:text-xs">
                  {s.label}
                </p>
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
                Post <span className="text-gold-500">Jaamacadda</span>
              </h2>
              <p className="mt-2 text-navy-500">
                Ogeysiisyada iyo dhacdooyinka ugu dambeeyay
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
                Eeg Dhammaan Post
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
            Wax kasta oo aad u baahan tahay
          </h2>
          <p className="mt-3 text-navy-500">
            Nidaam dhamaystiran oo u gaar ah maamulka fasalka iyo xaadirinta.
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