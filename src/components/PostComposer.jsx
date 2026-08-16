//scr/components/PostComposter.jsx
import { useState, useRef } from "react";
import { Image as ImageIcon, X, Send, ShieldCheck } from "lucide-react";
import { createPost } from "../firebase/posts";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function PostComposer() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [posting, setPosting] = useState(false);
  const fileInput = useRef(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected];
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (idx) => {
    setFiles((f) => f.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    setPosting(true);
    try {
      await createPost({
        authorId: user.uid,
        authorName: user.fullName,
        authorRole: user.role,
        text: text.trim(),
        files,
      });
      setText("");
      setFiles([]);
      setPreviews([]);
      if (fileInput.current) fileInput.current.value = "";
      toast.success("Post-ka waa la dhajiyay!");
    } catch (err) {
      console.error("createPost failed:", err);
      toast.error(
        err?.code === "storage/unauthorized"
          ? "Firebase Storage rules ma ogola upload-ka. Fadlan hubi Storage Rules."
          : err?.message || "Wax qalad ah ayaa dhacay marka la dirayay post-ka."
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-gold-400">
            <span className="text-sm">💬</span>
          </span>
          <div>
            <p className="font-display text-base font-semibold text-navy-800">
              Maxaa cusub?
            </p>
            <p className="text-xs text-navy-500">
              Ogeysii Post jaamacadda waxa cusub, muhiim ah ama fikradahaaga.
            </p>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Maxaa cusub? Ogeysii Post jaamacadda..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gold-300 bg-gold-50/40 px-4 py-3 text-sm outline-none focus:border-gold-500"
        />

        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square">
                {files[i]?.type.startsWith("video") ? (
                  <video src={src} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <img src={src} alt="" className="h-full w-full rounded-lg object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-rose p-1 text-white shadow"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 border-t border-navy-50 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-navy-50">
            <ImageIcon size={18} className="mt-0.5 text-navy-500" />
            <span>
              <span className="block text-sm font-medium text-navy-700">
                Sawir / Muuqaal
              </span>
              <span className="block text-xs text-navy-400">
                JPG, PNG ama MP4 ilaa 10MB — dhawr sawir waa la dooran karaa
              </span>
            </span>
            <input
              ref={fileInput}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            disabled={posting || (!text.trim() && files.length === 0)}
            className="flex items-center justify-center gap-2 rounded-lg bg-navy-700 px-6 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-navy-600 disabled:opacity-40"
          >
            <Send size={14} />
            {posting ? "Dirayaa..." : "Dhajiso"}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy-50/70 px-3.5 py-2.5">
          <ShieldCheck size={14} className="shrink-0 text-navy-400" />
          <p className="text-xs text-navy-500">
            Nidaamka ayaa hubinaya in qoraalladu ku habboon yihiin bulshadeena.
          </p>
        </div>
      </form>
    </div>
  );
}