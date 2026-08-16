import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Settings2, Download, FileText, Printer, IdCard } from "lucide-react";
import idFront from "../../assets/IMAM_University_ID_Front.jpg";
import idBack from "../../assets/IMAM_University_ID_Back.png";
import { saveIdCard } from "../../firebase/idcards";

const overlayStyle = {
  idno: { top: "61.9%", left: "48%", width: "22%", fontSize: "13px", textAlign: "left" },
  name: { top: "68.2%", left: "27%", width: "68%", fontSize: "10.5px", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  title: { top: "73.9%", left: "38%", width: "60%", fontSize: "11.5px", textAlign: "left" },
  issue: { top: "86.3%", left: "44%", width: "50%", fontSize: "12px", textAlign: "left", color: "#fff" },
  expiry: { top: "91.1%", left: "44%", width: "45%", fontSize: "12px", textAlign: "left", color: "#fff" },
};

function fmt(dateStr) {
  if (!dateStr) return "DD-MM-YYYY";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

export default function CreateIdCard() {
  const [idNo, setIdNo] = useState("0000");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [issue, setIssue] = useState("");
  const [expiry, setExpiry] = useState("");
  const [photoSrc, setPhotoSrc] = useState("");
  const [printSize, setPrintSize] = useState("auto");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const downloadCard = async (ref, filename) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;
    const [canvasFront, canvasBack] = await Promise.all([
      html2canvas(frontRef.current, { scale: 3, backgroundColor: "#ffffff", useCORS: true }),
      html2canvas(backRef.current, { scale: 3, backgroundColor: "#ffffff", useCORS: true }),
    ]);
    const w = 60;
    const h = w * (canvasFront.height / canvasFront.width);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [w, h] });
    pdf.addImage(canvasFront.toDataURL("image/png"), "PNG", 0, 0, w, h);
    pdf.addPage([w, h], "portrait");
    pdf.addImage(canvasBack.toDataURL("image/png"), "PNG", 0, 0, w, h);
    pdf.save("id_card.pdf");
  };

  const PAGE_SIZES = {
    auto: "auto",
    a4: "210mm 297mm",
    letter: "8.5in 11in",
    a5: "148mm 210mm",
    cr80: "85.6mm 54mm landscape",
  };

  const handlePrint = () => {
    const styleTag = document.getElementById("dynamicPageStyle");
    if (printSize === "cr80") {
      styleTag.textContent = `
        @page{ size:${PAGE_SIZES.cr80}; margin:0; }
        .idcard-print{ width:85.6mm !important; }
        .cardWrap-print{ gap:0 !important; }
      `;
    } else {
      const size = printSize === "auto" ? "auto" : PAGE_SIZES[printSize];
      styleTag.textContent = `@page{ size:${size}; margin:8mm; }`;
    }
    setTimeout(() => window.print(), 50);
  };

  const showMsg = (text, ok) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  // Generate now also saves the card to Firestore, so it appears in
  // the "All ID Cards" list immediately.
  const handleGenerate = async () => {
    if (!idNo.trim() || !name.trim()) {
      showMsg("Fadlan buuxi ID No iyo Name ❌", false);
      return;
    }
    setSaving(true);
    try {
      await saveIdCard({
        idNo: idNo.trim(),
        name: name.trim(),
        title: title.trim(),
        issue: fmt(issue),
        expiry: fmt(expiry),
        photo: photoSrc,
      });
      showMsg("ID Card waa la keydiyay ✅", true);
    } catch (err) {
      showMsg("Khalad ❌ " + (err.message || ""), false);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!document.getElementById("dynamicPageStyle")) {
      const tag = document.createElement("style");
      tag.id = "dynamicPageStyle";
      document.head.appendChild(tag);
    }
  }, []);

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .cardWrap-print, .cardWrap-print * { visibility: visible !important; }
          .cardWrap-print {
            position: fixed; top: 0; left: 0; margin: 0;
            gap: 6mm; display: flex; flex-wrap: wrap;
            justify-content: flex-start; align-items: flex-start;
          }
          .idcard-print {
            box-shadow: none !important; border-radius: 0 !important;
            width: 54mm !important; break-inside: avoid;
          }
        }
      `}</style>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-gold-400">
          <IdCard size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">
            Create ID Card
          </h1>
          <p className="text-xs text-navy-400">Overview › Create ID Card</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-navy-100 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-navy-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-700 text-gold-400">
            <Settings2 size={14} />
          </span>
          ID Card Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">
              Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full rounded-md border border-navy-100 px-2 py-2 text-xs outline-none focus:border-gold-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">
              ID No
            </label>
            <input
              value={idNo}
              onChange={(e) => setIdNo(e.target.value)}
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">
              Enter Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Magaca oo dhan"
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tusaale: Xubin Shaqaale"
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">
              Issue Date
            </label>
            <input
              type="date"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            />
          </div>
        </div>

        <div className="mt-4 max-w-xs">
          <label className="mb-1.5 block text-xs font-semibold text-navy-600">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerate}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-navy-700 px-5 py-2.5 text-sm font-semibold text-parchment hover:bg-navy-600 disabled:opacity-60"
          >
            <Settings2 size={15} />
            {saving ? "Kaydinaya..." : "Generate"}
          </button>
          <button
            onClick={() => downloadCard(frontRef, "id_card_front.png")}
            className="flex items-center gap-1.5 rounded-md bg-sage px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Download size={15} />
            Download Front
          </button>
          <button
            onClick={() => downloadCard(backRef, "id_card_back.png")}
            className="flex items-center gap-1.5 rounded-md bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Download size={15} />
            Download Back
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 rounded-md bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <FileText size={15} />
            Download PDF
          </button>

          <div className="flex items-center gap-2 rounded-md border border-navy-100 bg-navy-50/60 px-3 py-2">
            <label htmlFor="printSize" className="text-xs font-semibold text-navy-600">
              🖨️ Print Size
            </label>
            <select
              id="printSize"
              value={printSize}
              onChange={(e) => setPrintSize(e.target.value)}
              className="rounded-md border border-navy-100 bg-white px-2 py-1.5 text-xs outline-none"
            >
              <option value="auto">Auto (Card size)</option>
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="a5">A5</option>
              <option value="cr80">CR80 Card (85.6x54mm)</option>
            </select>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md bg-navy-400 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Printer size={15} />
            Print
          </button>
        </div>

        {msg && (
          <p className={`mt-3 text-sm font-semibold ${msg.ok ? "text-sage" : "text-rose"}`}>
            {msg.text}
          </p>
        )}
      </div>

      <div className="cardWrap-print mt-6 flex flex-wrap justify-center gap-8">
        <div
          ref={frontRef}
          className="idcard-print relative w-[340px] overflow-hidden rounded-2xl shadow-xl"
        >
          <img src={idFront} alt="ID Front" className="block w-full" crossOrigin="anonymous" />

          <div
            className="absolute overflow-hidden"
            style={{ top: "32.8%", left: "26.0%", width: "43.5%", height: "28.8%" }}
          >
            {photoSrc ? (
              <img
                src={photoSrc}
                alt="Photo"
                crossOrigin="anonymous"
                className="absolute left-0 top-0 h-full w-full object-cover object-top"
                style={{ clipPath: "circle(50% at 50% 50%)", borderRadius: "50%" }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11.5px] text-navy-300">
                Photo
              </div>
            )}
          </div>

          <div className="absolute select-none font-extrabold text-[#1a1a2e]" style={overlayStyle.idno}>
            {idNo}
          </div>
          <div className="absolute select-none font-extrabold text-[#1a1a2e]" style={overlayStyle.name}>
            {name}
          </div>
          <div className="absolute select-none font-extrabold text-[#1a1a2e]" style={overlayStyle.title}>
            {title}
          </div>
          <div className="absolute select-none font-extrabold" style={overlayStyle.issue}>
            {fmt(issue)}
          </div>
          <div className="absolute select-none font-extrabold" style={overlayStyle.expiry}>
            {fmt(expiry)}
          </div>
        </div>

        <div
          ref={backRef}
          className="idcard-print relative w-[340px] overflow-hidden rounded-2xl shadow-xl"
        >
          <img src={idBack} alt="ID Back" className="block w-full" crossOrigin="anonymous" />
        </div>
      </div>
    </div>
  );
}