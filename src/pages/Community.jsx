// src/pages/Community.jsx — PUBLIC, view-only community page (/community).
// No composer here. Anonymous visitors get ProfileGate once; logged-in
// portal users (admin/teacher/student navigating here) use their real
// account identity instead and are never asked for a guest profile.
import { useEffect, useState } from "react";
import { subscribeToPosts } from "../firebase/posts";
import PostCard from "../components/PostCard";
import ProfileGate from "../components/ProfileGate";
import { useCommunityProfile } from "../hooks/useCommunityProfile";
import { useAuth } from "../context/AuthContext";
import { Bell, Send } from "lucide-react";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile, saveProfile, hasProfile } = useCommunityProfile();

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

  useEffect(() => {
    const unsub = subscribeToPosts((data) => {
      setPosts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Pinned-ka marwalba kor, kadibna kan ugu dambeeyay la pin-gareeyay,
  // kadibna kuwa kale sida caadiga ah (ugu cusub kor). Waxaan halkan ku
  // sameynaa (ma aha PostCard.jsx gudihiisa) sababtoo ah PostCard hal
  // post kaliya buu bixiyaa — liiska oo dhan halkan ayuu ku jiraa.
  const sortedPosts = [...posts].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (a.pinned && b.pinned) {
      return (b.pinnedAt?.toMillis?.() || 0) - (a.pinnedAt?.toMillis?.() || 0);
    }
    return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
  });

  // Only ask a guest for a name/photo. A logged-in portal user (any
  // role) already has an identity via useAuth() and should never see
  // this gate.
  const needsProfileGate = !user && !hasProfile;

  return (
    <div>
      {needsProfileGate && <ProfileGate onComplete={saveProfile} />}

      {/* Decorative hero band */}
      <section className="relative overflow-hidden bg-navy-700 py-14 text-center text-parchment sm:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-8 h-32 w-32 rounded-full border border-gold-500/20 sm:left-16" />
          <div className="absolute right-6 top-10 grid grid-cols-4 gap-1.5 opacity-30 sm:right-16">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-gold-400" />
            ))}
          </div>
          <Bell className="absolute left-8 bottom-6 text-gold-400/70 sm:left-20" size={30} />
          <span className="absolute left-[68px] bottom-[70px] flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900 sm:left-[80px]">
            3
          </span>
          <Send className="absolute right-8 top-16 rotate-45 text-parchment/60 sm:right-24" size={26} />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          {!user && profile && (
            <div className="absolute -top-2 left-0 flex items-center gap-2 sm:left-4">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gold-400/40 bg-navy-800">
                {profile.photo ? (
                  <img src={profile.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-gold-300">
                    {profile.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </span>
              <span className="hidden text-xs font-medium text-navy-100 sm:block">
                {profile.name}
              </span>
            </div>
          )}

          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/50 bg-gold-500/10 text-gold-400">
            <span className="text-2xl">📣</span>
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Post <span className="text-gold-400">University</span>
          </h1>
          <p className="mt-2 text-sm text-navy-100">
            Latest Announcements, Photos & Events
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* No composer here — posting only happens from /admin/community.
            This page is always view-only: hideActions=true forces edit,
            delete, pin, and like-boost OFF for every visitor here,
            including a logged-in admin browsing the public page. Those
            controls only ever appear inside the admin panel, where
            PostCard is rendered WITHOUT hideActions. */}

        {loading && (
          <p className="text-center text-sm text-navy-400">Soo dejinaya...</p>
        )}

        {!loading && posts.length === 0 && (
          <div className="rounded-lg border border-dashed border-navy-200 py-16 text-center">
            <p className="text-sm text-navy-400">
              Weli wax post ah lama dhigin. Soo noqo dhawaan!
            </p>
          </div>
        )}

        <div className="space-y-5">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} communityProfile={profile} hideActions />
          ))}
        </div>
      </section>
    </div>
  );
}