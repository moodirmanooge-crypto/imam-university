import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { addDepartment, getDepartments, deleteDepartment } from "../../firebase/admin";
import DepartmentDetail from "./DepartmentDetail";
import toast from "react-hot-toast";

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [openDept, setOpenDept] = useState(null);

  const load = async () => {
    setLoading(true);
    setDepartments(await getDepartments());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Magaca Fasalka waa lagama maarmaan.");
      return;
    }
    setSaving(true);
    try {
      await addDepartment(name);
      toast.success("Fasalkii waa la daray!");
      setName("");
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ma hubtaa inaad tirtirto fasalkan?")) return;
    await deleteDepartment(id);
    load();
  };

  // Drill-down view for a single department
  if (openDept) {
    return (
      <DepartmentDetail
        department={openDept}
        onBack={() => setOpenDept(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        class (Departments)
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Samee class guud (tusaale: IT, Medicine, Business). Riix fasal si
        aad u aragto semester-yadiisa, Studentdiisa iyo macalimiintiisa.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex gap-2 rounded-xl border border-navy-100 bg-white p-6"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Magaca Fasalka (tusaale: Information Technology)"
          className="flex-1 rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-navy-700 px-5 py-2.5 text-sm font-semibold text-parchment disabled:opacity-60"
        >
          <Plus size={16} />
          {saving ? "Kaydinaya..." : "Ku dar"}
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-navy-100 bg-white">
        {loading && (
          <p className="p-6 text-center text-sm text-navy-400">
            Soo dejinaya...
          </p>
        )}
        {!loading && departments.length === 0 && (
          <p className="p-6 text-center text-sm text-navy-400">
            Weli fasal lama sameyn.
          </p>
        )}
        {departments.map((d, i) => (
          <div
            key={d.id}
            className={`flex items-center justify-between px-5 py-3.5 ${
              i !== departments.length - 1 ? "border-b border-navy-50" : ""
            }`}
          >
            <button
              onClick={() => setOpenDept(d.name)}
              className="flex flex-1 items-center justify-between text-left"
            >
              <p className="text-sm font-medium text-navy-800">{d.name}</p>
              <ChevronRight size={16} className="text-navy-300" />
            </button>
            <button
              onClick={() => handleDelete(d.id)}
              className="ml-4 text-rose hover:opacity-70"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}