// src/pages/student/StudentSettings.jsx
import { useEffect, useRef, useState } from "react";
import { Settings, Camera, Eye, EyeOff, Save, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateStudentProfile } from "../../firebase/studentProfile";
import toast from "react-hot-toast";

export default function StudentSettings() {
  const { user, refreshUser } = useAuth();

  const [photoPreview, setPhotoPreview] = useState(user.photo || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);

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

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Labada password isma eka.");
      return;
    }
    setSaving(true);
    try {
      await updateStudentProfile(user.uid, {
        photo: photoPreview,
        password: newPassword.trim() || undefined,
      });
      toast.success("Xogtaada waa la cusboonaysiiyay!");
      setNewPassword("");
      setConfirmPassword("");
      // Pushes the new photo into the shared session so the sidebar
      // avatar (DashboardLayout) reflects it immediately.
      if (refreshUser) refreshUser({ photo: photoPreview });
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-gold-400">
          <Settings size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">
            Settings
          </h1>
          <p className="text-xs text-navy-400">Xaadirintayda › Settings</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg rounded-xl border border-navy-100 bg-white p-6"
      >
        {/* Student ID — locked, shown read-only */}
        <div className="mb-5 flex items-center gap-2 rounded-md bg-navy-50/60 px-3 py-2.5">
          <Lock size={14} className="text-navy-400" />
          <p className="text-xs text-navy-500">
            Student ID:{" "}
            <span className="font-mono font-semibold text-navy-700">
              {user.uid}
            </span>{" "}
            <span className="text-navy-400">(lama badali karo)</span>
          </p>
        </div>

        {/* Name — locked, shown read-only */}
        <div className="mb-5 flex items-center gap-2 rounded-md bg-navy-50/60 px-3 py-2.5">
          <Lock size={14} className="text-navy-400" />
          <p className="text-xs text-navy-500">
            Magaca:{" "}
            <span className="font-semibold text-navy-700">
              {user.fullName}
            </span>{" "}
            <span className="text-navy-400">(lama badali karo)</span>
          </p>
        </div>

        {/* Photo — fixed square size */}
        <div className="mb-2 flex justify-center">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-navy-200 bg-navy-50 text-navy-400 hover:border-gold-400"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera size={24} />
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
        <p className="mb-5 text-center text-[11px] text-navy-400">
          Riix sawirka si aad u bedesho
        </p>

        {/* Password */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-navy-600">
            Password Cusub
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ka bannaan haddii aadan bedelin"
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 pr-10 text-sm outline-none focus:border-gold-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {newPassword && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">
              Xaqiiji Password-ka Cusub
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ku celi password-ka cusub"
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? "Kaydinaya..." : "Kaydi"}
        </button>
      </form>
    </div>
  );
}