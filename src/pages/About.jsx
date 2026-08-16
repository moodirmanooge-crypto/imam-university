import { useEffect } from "react";
import { Target, Eye, Sparkles } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Hadafkeenna",
    desc: "In aan si sahal ah oo casri ah u maamulno xaadirinta iyo xiriirka u dhexeeya Students, Teachers iyo maamulka.",
  },
  {
    icon: Eye,
    title: "Aragtideenna",
    desc: "In Portal-kani noqdo nidaamka rasmiga ah ee lagu maamulo waxbarashada jaamacadaha Soomaaliyeed.",
  },
  {
    icon: Sparkles,
    title: "Qiyamkeenna",
    desc: "Sahlanaan, daacadnimo iyo horumar joogto ah — dhammaan waxaa lagu dhisay bulshadeenna tacliinta.",
  },
];

export default function About() {
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

  return (
    <div>
      <section className="bg-navy-700 py-16 text-center text-parchment">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Ku Saabsan Jaamacadda
          </h1>
          <p className="mt-4 text-navy-100">
            Nidaam digital ah oo isku xira Students, Teachers iyo maamulka
            hal meel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-navy-100 bg-white p-7"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-700 text-gold-400">
                <v.icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-navy-800">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-gold-200 bg-gold-50 p-8 sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-navy-800">
            Taariikhda
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-600">
            Portal-kan waxaa loo dhisay si loo beddelo habka gacanta lagu
            qorayay xaadirinta iyo diiwaanka Students oo loo rogo nidaam
            elektaroonig ah oo dhab ah, degdeg ah, oo aan lumin xogta.
          </p>
        </div>
      </section>
    </div>
  );
}