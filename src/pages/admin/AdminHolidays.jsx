// src/pages/admin/AdminHolidays.jsx
import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarOff } from "lucide-react";
import { addHoliday, getHolidays, deleteHoliday } from "../../firebase/admin";
import toast from "react-hot-toast";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isActiveHoliday(h) {
  const today = todayStr();
  return h.startDate <= today && today <= h.endDate;
}

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setHolidays(await getHolidays());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      toast.error("Fadlan buuxi Title, Start Date iyo End Date.");
      return;
    }
    if (endDate < startDate) {
      toast.error("End Date waa in ay ka dambaysaa Start Date.");
      return;
    }
    setSaving(true);
    try {
      await addHoliday({ title, startDate, endDate });
      toast.success("Fasaxii waa la daray!");
      setTitle("");
      setStartDate("");
      setEndDate("");
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ma hubtaa inaad tirtirto fasaxan?")) return;
    await deleteHoliday(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-gold-400">
          <CalendarOff size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">
            Holidays
          </h1>
          <p className="text-xs text-navy-400">
            Maalmaha fasaxa — attendance-ka waa la xayirayaa muddadan.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-navy-100 bg-white p-6 sm:grid-cols-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Magaca Fasaxa (tusaale: Eid Holiday)"
          className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 sm:col-span-2"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-parchment disabled:opacity-60 sm:col-span-4"
        >
          <Plus size={16} />
          {saving ? "Kaydinaya..." : "Ku dar Fasax"}
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-navy-100 bg-white">
        {loading && (
          <p className="p-6 text-center text-sm text-navy-400">Soo dejinaya...</p>
        )}
        {!loading && holidays.length === 0 && (
          <p className="p-6 text-center text-sm text-navy-400">
            Weli fasax lama sameyn.
          </p>
        )}
        {holidays.map((h, i) => {
          const active = isActiveHoliday(h);
          return (
            <div
              key={h.id}
              className={`flex items-center justify-between px-5 py-3.5 ${
                i !== holidays.length - 1 ? "border-b border-navy-50" : ""
              }`}
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-navy-800">
                  {h.title}
                  {active && (
                    <span className="rounded-full bg-rose/10 px-2 py-0.5 text-[10px] font-semibold text-rose">
                      Hadda socda
                    </span>
                  )}
                </p>
                <p className="font-mono text-xs text-navy-400">
                  {h.startDate} → {h.endDate}
                </p>
              </div>
              <button
                onClick={() => handleDelete(h.id)}
                className="text-rose hover:opacity-70"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}