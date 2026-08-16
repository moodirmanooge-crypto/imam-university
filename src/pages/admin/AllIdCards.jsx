import { useEffect, useState } from "react";
import { Search, Trash2, CheckCircle2, IdCard as IdCardIcon, Printer } from "lucide-react";
import { getIdCards, deleteIdCard, markIdCardPrinted } from "../../firebase/idcards";
import idFront from "../../assets/IMAM_University_ID_Front.jpg";
import toast from "react-hot-toast";

export default function AllIdCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setCards(await getIdCards());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = cards.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.idNo?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q);
  });

  const printedCount = cards.filter((c) => c.printed).length;

  const handleDelete = async (idNo) => {
    if (!confirm("Ma hubtaa inaad tirtirto ID card-kan?")) return;
    await deleteIdCard(idNo);
    toast.success("ID card-kii waa la tirtiray.");
    load();
  };

  const handleMarkPrinted = async (idNo, current) => {
    await markIdCardPrinted(idNo, !current);
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-gold-400">
          <IdCardIcon size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">
            All ID Cards
          </h1>
          <p className="text-xs text-navy-400">Overview › All ID Cards</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-navy-100 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-bold text-navy-700">
            {cards.length} Total
          </span>
          <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-bold text-sage">
            {printedCount} Printed
          </span>
          <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-700">
            {cards.length - printedCount} Not Printed
          </span>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-md border border-navy-100 px-3 py-2.5">
          <Search size={16} className="text-navy-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Raadi ID No ama Magaca..."
            className="w-full text-sm outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-navy-50 text-xs uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-3 py-2.5">Card</th>
                <th className="px-3 py-2.5">ID No</th>
                <th className="px-3 py-2.5">Magaca</th>
                <th className="px-3 py-2.5">Title</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-navy-400">
                    Soo dejinaya...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-navy-400">
                    {cards.length === 0 ? "Weli ID card lama sameyn." : "Wax natiijo ah lama helin."}
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-3 py-2.5">
                    <div className="relative h-[86px] w-[52px] overflow-hidden rounded-md bg-navy-50 shadow">
                      <img src={idFront} alt="" className="h-full w-full object-cover" />
                      {c.photo && (
                        <img
                          src={c.photo}
                          alt=""
                          className="absolute rounded-full object-cover"
                          style={{
                            top: "32.8%",
                            left: "26.0%",
                            width: "43.5%",
                            height: "25.96%",
                            clipPath: "circle(50% at 50% 50%)",
                          }}
                        />
                      )}
                      <div
                        className="absolute overflow-hidden whitespace-nowrap text-[2.6px] font-extrabold text-[#1a1a2e]"
                        style={{ top: "68.2%", left: "27%", width: "69%", textAlign: "center" }}
                      >
                        {c.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-navy-600">{c.idNo}</td>
                  <td className="px-3 py-2.5 text-navy-800">{c.name}</td>
                  <td className="px-3 py-2.5 text-navy-500">{c.title || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        c.printed ? "bg-sage/15 text-sage" : "bg-navy-50 text-navy-500"
                      }`}
                    >
                      {c.printed ? "Printed" : "Not Printed"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleMarkPrinted(c.idNo, c.printed)}
                        className="flex items-center gap-1 rounded-md bg-gold-100 px-2.5 py-1.5 text-[11px] font-bold text-gold-700 hover:opacity-80"
                      >
                        <CheckCircle2 size={12} />
                        {c.printed ? "Unmark" : "Mark Printed"}
                      </button>
                      <button
                        onClick={() => handleDelete(c.idNo)}
                        className="flex items-center gap-1 rounded-md bg-rose/10 px-2.5 py-1.5 text-[11px] font-bold text-rose hover:opacity-80"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}