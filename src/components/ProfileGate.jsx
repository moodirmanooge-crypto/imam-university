// src/components/ProfileGate.jsx
import { useRef, useState } from "react";
import { User, Camera, Check } from "lucide-react";

export default function ProfileGate({ onComplete }) {
  const [name, setName] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInput = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({ name: name.trim(), photo: photoPreview });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 text-gold-400">
            <User size={24} />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-navy-800">
            Ku soo dhawoow Post
          </h2>
          <p className="mt-1 text-xs text-navy-500">
            Geli magacaaga iyo sawir si ay bulshadu kuu aqoonsato — waxaan
            kaliya ku weydiinaynaa hal mar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-navy-200 bg-navy-50 text-navy-400 hover:border-gold-400"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Camera size={22} />
              )}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">
              Magacaaga
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tusaale: Amina Cabdi"
              autoFocus
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-40"
          >
            <Check size={15} />
            Sii Wad
          </button>
        </form>
      </div>
    </div>
  );
}