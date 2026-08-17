//src/pages/aboute.jsx
import {
  Calendar,
  Users,
  Award,
  Layers,
  Clock,
  UserCheck,
  DollarSign,
  Monitor,
  Shield,
  UserCog,
  Grid,
  BookOpen,
} from "lucide-react";
import heroImage from "../assets/imam.png";
import background from "../assets/background.png";
import objectivesImage from "../assets/IMAGE.png";
import logo from "../assets/logo.png";
import useDisableDevTools from "../hooks/useDisableDevTools"; // xanib F12 iyo devtools-ka

const stats = [
  { icon: Calendar, value: "13+", label: "year of experience" },
  { icon: Users, value: "1,000+", label: "Graduated" },
  { icon: Award, value: "10+", label: "Certified awards" },
];

const objectives = [
  {
    icon: Layers,
    text: "To fight ignorance and eliminate poverty by providing quality education and for sustainable development.",
  },
  {
    icon: Clock,
    text: "To enhance the competency in all skills, professionalism and install positive attitude in order to product effective scholars and leaders.",
  },
  {
    icon: UserCheck,
    text: "To inculcate in the minds of students and the larger population, the culture of creative and intellectualism based research and scholarly work.",
  },
  {
    icon: DollarSign,
    text: "To empower the youth with skills and knowledge for sustainable development.",
  },
];

const coreValues = [
  {
    icon: Monitor,
    title: "Integrity",
    desc: "We act with honesty and strong moral principles.",
  },
  {
    icon: BookOpen,
    title: "Accountability & Transparency",
    desc: "We take responsibility and operate openly.",
  },
  {
    icon: Shield,
    title: "Honesty & Truth",
    desc: "We uphold truthfulness in all interactions.",
  },
  {
    icon: UserCog,
    title: "Equity and justice",
    desc: "We ensure fairness, inclusion, and equal opportunity.",
    hot: true,
  },
  {
    icon: Grid,
    title: "Student's development and empowerment",
    desc: "We nurture and support students to reach their full potential.",
  },
  {
    icon: Grid,
    title: "Service Excellence",
    desc: "We are dedicated to delivering our best at all times.",
  },
];

export default function About() {
  useDisableDevTools(); // xanib F12, right-click, iyo shortcuts-ka DevTools-ka

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[380px] items-center justify-center overflow-hidden bg-neutral-900 text-center text-white">
        <img
          src={heroImage}
          alt="IMAM University graduation ceremony"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative z-10 px-4">
          <h1 className="text-5xl font-extrabold tracking-tight"></h1>
          <p className="mt-4 text-sm text-white/90">
            <span></span> <span className="mx-1"></span>{" "}
            <span></span>
          </p>
        </div>
      </section>

      {/* Background */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <img
          src={background}
          alt="IMAM University graduate receiving a gift"
          className="w-full rounded-lg object-cover"
        />
        <div>
          <h2 className="text-4xl font-extrabold text-neutral-900">
            Background
          </h2>
          <p className="mt-5 leading-relaxed text-neutral-700">
            <strong>IMAM University (IU)</strong> is a nonprofit educational
            institution based in Somalia. It was founded in 2012 by a group
            of Somali scholars in order to fill the gaps left by the lack of
            a central government over the decades. IU has dedicated to
            providing brilliant education to the students who have selected
            it as their access point to higher education. Beyond enabling
            young learners to work towards their anticipated professions, The
            Highest aim behind this is to contribute and covering the
            society's need for higher education and scientific research.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <s.icon className="mb-2 h-8 w-8 text-indigo-600" />
                <p className="text-2xl font-bold text-neutral-900">
                  {s.value}
                </p>
                <p className="text-sm text-neutral-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-4xl font-extrabold text-neutral-900">
            Our Mission and Vision
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-lg bg-white p-10 shadow-sm">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                <Award className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">
                Our Vision
              </h3>
              <p className="mt-3 text-neutral-600">
                To become the leading light fountain of knowledge across the
                regions and the globe backed by research and knowledge.
              </p>
            </div>

            <div className="rounded-lg bg-white p-10 shadow-sm">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">
                Our Mission
              </h3>
              <p className="mt-3 text-neutral-600">
                To provide education which intends to realize qualified and
                competent professionals that uphold excellence, integrity,
                efficiency and effective work-oriented generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-extrabold text-neutral-900">
              Objectives
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {objectives.map((o, i) => (
                <div key={i} className="flex gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-indigo-700 text-white">
                    <o.icon className="h-6 w-6" />
                  </span>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {o.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <img
            src={objectivesImage}
            alt="Illustration representing growth and development"
            className="mx-auto w-full max-w-sm"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-4xl font-extrabold text-neutral-900">
            Our Core Values
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-2">
            {coreValues.map((v, i) => (
              <div
                key={v.title}
                className={`relative flex gap-4 border-b border-neutral-200 pb-8 ${
                  i >= coreValues.length - 2 ? "border-b-0" : ""
                }`}
              >
                <v.icon className="h-6 w-6 shrink-0 text-neutral-900" />
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-neutral-600">{v.desc}</p>
                </div>
                {v.hot && (
                  <span className="absolute -right-2 top-0 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    hot
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}