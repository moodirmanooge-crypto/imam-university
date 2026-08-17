import { useEffect, useState } from "react";
import { Users2, GraduationCap, Building2 } from "lucide-react";
import { getStudents, getTeachers, getDepartments } from "../../firebase/admin";

export default function AdminOverview() {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, departments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [students, teachers, departments] = await Promise.all([
        getStudents(),
        getTeachers(),
        getDepartments(),
      ]);
      setCounts({
        students: students.length,
        teachers: teachers.length,
        departments: departments.length,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Students", value: counts.students, icon: GraduationCap },
    { label: "Teachers", value: counts.teachers, icon: Users2 },
    { label: "class", value: counts.departments, icon: Building2 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Overview
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Here, you can view a complete overview of all portal statistics and key performance data in one place.

      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-navy-100 bg-white p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-700 text-gold-400">
              <c.icon size={18} />
            </span>
            <p className="mt-4 font-display text-3xl font-semibold text-navy-800">
              {loading ? "…" : c.value}
            </p>
            <p className="mt-1 text-sm text-navy-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}