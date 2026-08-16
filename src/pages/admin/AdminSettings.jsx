import { useEffect, useState } from "react";
import { Settings, Eye, EyeOff, Save, ShieldCheck, User, KeyRound } from "lucide-react";
import { getAdminCredentials, updateAdminCredentials } from "../../firebase/admin";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [currentUsername, setCurrentUsername] = useState("");
  const [loading, setLoading] = useState(true);

  // "choice": what the admin wants to change — asked first
  const [choice, setChoice] = useState(null); // "username" | "password" | "both" | null

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pendingChanges, setPendingChanges] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminCredentials();
      setCurrentUsername(data.username || "");
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetAll = () => {
    setChoice(null);
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setPendingChanges(null);
  };

  const wantsUsername = choice === "username" || choice === "both";
  const wantsPassword = choice === "password" || choice === "both";

  const handleReviewChanges = (e) => {
    e.preventDefault();

    if (wantsUsername && !newUsername.trim()) {
      toast.error("Fadlan geli username-ka cusub.");
      return;
    }
    if (wantsPassword && !newPassword.trim()) {
      toast.error("Fadlan geli password-ka cusub.");
      return;
    }
    if (wantsPassword && newPassword !== confirmPassword) {
      toast.error("Labada password isma eka.");
      return;
    }

    setPendingChanges({
      username: wantsUsername ? newUsername.trim() : null,
      password: wantsPassword ? newPassword : null,
    });
  };

  const handleConfirm = async () => {
    if (!pendingChanges) return;
    setSaving(true);
    try {
      await updateAdminCredentials(pendingChanges);
      toast.success("Xogta admin-ka waa la cusboonaysiiyay!");
      if (pendingChanges.username) setCurrentUsername(pendingChanges.username);
      resetAll();
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
          <p className="text-xs text-navy-400">Overview › Settings</p>
        </div>
      </div>

      <div className="mt-6 max-w-lg rounded-xl border border-navy-100 bg-white p-6">
        <div className="mb-5 flex items-center gap-2 rounded-md bg-navy-50/60 px-3 py-2.5">
          <ShieldCheck size={15} className="text-navy-400" />
          <p className="text-xs text-navy-500">
            Username-ka hadda:{" "}
            <span className="font-mono font-semibold text-navy-700">
              {loading ? "..." : currentUsername}
            </span>
          </p>
        </div>

        {/* Step 1: ask what to change */}
        {!choice && !pendingChanges && (
          <div>
            <p className="mb-3 text-sm font-medium text-navy-700">
              Maxaad rabtaa inaad beddesho?
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <button
                onClick={() => setChoice("username")}
                className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 px-3 py-4 text-xs font-semibold text-navy-600 hover:border-gold-400 hover:bg-gold-50"
              >
                <User size={18} className="text-navy-500" />
                Username
              </button>
              <button
                onClick={() => setChoice("password")}
                className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 px-3 py-4 text-xs font-semibold text-navy-600 hover:border-gold-400 hover:bg-gold-50"
              >
                <KeyRound size={18} className="text-navy-500" />
                Password
              </button>
              <button
                onClick={() => setChoice("both")}
                className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 px-3 py-4 text-xs font-semibold text-navy-600 hover:border-gold-400 hover:bg-gold-50"
              >
                <ShieldCheck size={18} className="text-navy-500" />
                Labadaba
              </button>
            </div>
          </div>
        )}

        {/* Step 2: form for the chosen field(s) */}
        {choice && !pendingChanges && (
          <form onSubmit={handleReviewChanges} className="space-y-4">
            {wantsUsername && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-navy-600">
                  Username Cusub
                </label>
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Geli username-ka cusub"
                  className="w-full rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
                  autoFocus
                />
              </div>
            )}

            {wantsPassword && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy-600">
                    Password Cusub
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Geli password-ka cusub"
                      className="w-full rounded-md border border-navy-100 px-3 py-2.5 pr-10 text-sm outline-none focus:border-gold-400"
                      autoFocus={!wantsUsername}
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
                <div>
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
              </>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-parchment hover:bg-navy-600"
              >
                Eeg Isbeddelka
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-md border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50"
              >
                Jooji
              </button>
            </div>
          </form>
        )}

        {/* Step 3: confirm before saving */}
        {pendingChanges && (
          <div className="space-y-4">
            <div className="rounded-md border border-gold-300 bg-gold-50 p-4">
              <p className="text-xs font-semibold text-navy-700">
                Fadlan xaqiiji isbeddelkan ka hor intaadan save gareyn:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-navy-600">
                {pendingChanges.username && (
                  <li>
                    Username:{" "}
                    <span className="font-mono">{currentUsername}</span> →{" "}
                    <span className="font-mono font-semibold text-navy-800">
                      {pendingChanges.username}
                    </span>
                  </li>
                )}
                {pendingChanges.password && (
                  <li>Password: waa la beddelayaa (qarsoodi ah)</li>
                )}
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? "Kaydinaya..." : "Xaqiiji oo Kaydi"}
              </button>
              <button
                onClick={() => setPendingChanges(null)}
                disabled={saving}
                className="rounded-md border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50"
              >
                Dib u noqo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}