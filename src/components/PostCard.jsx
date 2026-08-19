//src/component/PostCard.jsx 
import { useState, useRef, useEffect } from "react";
import {
  Heart, MessageCircle, Share2, Pencil, Trash2, Check, X,
  ChevronLeft, ChevronRight, BadgeCheck, Link2, Pin, PinOff, Plus, Minus,
} from "lucide-react";
import {
  toggleLike, subscribeToComments, addComment, updatePostText, deletePost,
  setPostPinned, adjustBonusLikes,
} from "../firebase/posts";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

function timeAgo(ts) {
  if (!ts?.toDate) return "";
  const diff = (Date.now() - ts.toDate().getTime()) / 1000;
  if (diff < 60) return "Hadda";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes `;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saac`;
  return `${Math.floor(diff / 86400)} Days`;
}

function mediaGridClass(count) {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-2";
}

// A verified badge shows on any comment from a logged-in portal
// identity (admin, teacher, or student) — not just guests with a
// community profile — since they're all real university accounts.
function isVerifiedRole(role) {
  return role === "admin" || role === "teacher" || role === "student";
}

const ROLE_LABEL = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

// ---- Icon-yada brand-ka (SVG gudaha, si aan loogu baahnayn library dheeraad ah) ----
const WhatsAppIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.7-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.7 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.4z"/><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.2L2 22l4.9-1.3c1.5.8 3.2 1.3 5.1 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3 .8.8-2.9-.2-.3C3.6 15 3 13.5 3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9.2z"/></svg>
);
const TelegramIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path fill="currentColor" d="M21.5 3.5 2.7 10.9c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 5.5c.2.7 1.1.9 1.6.4l2.5-2.4 4.8 3.6c.7.5 1.7.1 1.9-.7l3.4-15.7c.2-1-.8-1.8-1.9-1.4zM8.6 14.5l-1.1-3.5 9.7-6.1-8.6 9.6z"/></svg>
);
const FacebookIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>
);
const XIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path fill="currentColor" d="M18.9 2H22l-7.2 8.3L23.3 22h-6.6l-5.2-6.8L5.6 22H2.4l7.7-8.8L1.7 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20z"/></svg>
);

// Identity + permission rules, single source of truth:
// - `useAuth()` is the ONLY source for admin/teacher/student identity
//   and edit/delete rights. A logged-in admin editing/deleting is
//   ALWAYS allowed regardless of which page rendered this card.
//   Their real profile photo (Settings-uploaded, stored on the user
//   session as `user.photo`) is used for their name/avatar on every
//   comment they leave — never blank when they have one on file.
// - `communityProfile` (from useCommunityProfile, public /community
//   page only) is used ONLY as a fallback identity for like/comment
//   when there is no logged-in portal user (i.e. an anonymous public
//   visitor). It NEVER grants edit/delete rights and is never
//   verified.
// - `hideActions` is an explicit page-level override to force
//   edit/delete off even for an admin (used on Home's post preview,
//   so admins browsing Home don't get edit controls out of context).
// - Pin toggle and manual like-boost follow the EXACT same gate as
//   edit/delete (`isAdmin` = logged-in admin AND !hideActions) — an
//   admin previewing on Home should not see these controls either.
export default function PostCard({ post, hideActions = false, communityProfile = null }) {
  const { user } = useAuth();

  const identity = user
    ? {
        uid: user.uid,
        name: user.fullName?.trim() || user.email || `Isticmaale-${user.uid?.slice(0, 5)}`,
        photo: user.photo || "",
        role: user.role,
      }
    : communityProfile
    ? {
        uid: communityProfile.id,
        name: communityProfile.name,
        photo: communityProfile.photo,
        role: "user",
      }
    : null;

  const uid = identity?.uid || "guest";
  const isLiked = post.likes?.includes(uid);
  const isAdmin = !hideActions && user?.role === "admin";

  // Tirada like-ga la muujinayo = real likes (array-ka uid-yada) + bonus
  // uu admin-ku gacanta ku darsaday. bonusLikes ma saameyn karto isLiked
  // state-ka — waa kaliya lambar lagu daray display-ka.
  const totalLikes = (post.likes?.length || 0) + (post.bonusLikes || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadedComments, setLoadedComments] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [saving, setSaving] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Share menu — kaliya waxaa loo isticmaalaa desktop-ka marka
  // navigator.share (native OS share sheet) uusan la heli karin.
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [preparingShare, setPreparingShare] = useState(false);
  const shareMenuRef = useRef(null);

  // Pin — loading guard si aan admin-ku labo jeer u riixin intii la
  // sugayay Firestore.
  const [pinning, setPinning] = useState(false);

  // Like-boost — popover leh input + quick-add buttons (admin-only).
  const [likeBoostOpen, setLikeBoostOpen] = useState(false);
  const [likeBoostValue, setLikeBoostValue] = useState("");
  const [boosting, setBoosting] = useState(false);
  const likeBoostRef = useRef(null);

  const media = post.media || [];
  const visibleMedia = media.slice(0, 4);
  const extraCount = media.length - 4;

  const handleLike = async () => {
    if (!identity) {
      toast.error("Fadlan geli magacaaga si aad u like-gareyso.");
      return;
    }
    await toggleLike(post.id, uid, isLiked);
  };

  const openComments = () => {
    setShowComments((v) => !v);
    if (!loadedComments) {
      subscribeToComments(post.id, setComments);
      setLoadedComments(true);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Fadlan geli magacaaga si aad u comment-geyso.");
      return;
    }
    if (!commentText.trim()) return;
    await addComment(post.id, {
      authorName: identity.name,
      authorPhoto: identity.photo,
      authorRole: identity.role,
      text: commentText.trim(),
    });
    setCommentText("");
  };

  // ---- PIN (admin-only) ----
  // Halkan waxaan kaliya beddelaynaa `post.pinned` gudaha Firestore.
  // In post-ku "kor u ahaado marwalba" waa mas'uul ka ah component-ka
  // feed-ka (kaas oo liiska post-yada soo saara) — waa inuu sort-eeyo
  // pinned:true kor marka la soo daawan karo. Fiiri faallada hoose ee
  // "SORT-KA FEED-KA" ee la siiyay hoosta jawaabtan.
  const handleTogglePin = async () => {
    setPinning(true);
    try {
      await setPostPinned(post.id, !post.pinned);
      toast.success(!post.pinned ? "Post-ka waa Pined📌 (pin)!" : "Pin-ka waa la saaray.");
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay marka pin-ka la beddelayay.");
    } finally {
      setPinning(false);
    }
  };

  // ---- LIKE BOOST (admin-only) ----
  // amount waxa ay noqon kartaa +tiro ama -tiro (increment/decrement).
  const handleBoostLikes = async (amount) => {
    if (!amount) return;
    setBoosting(true);
    try {
      await adjustBonusLikes(post.id, amount);
      toast.success(amount > 0 ? `+${amount} like waa lagu daray!` : `${amount} like ayaa laga jaray.`);
      setLikeBoostValue("");
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setBoosting(false);
    }
  };

  const handleCustomBoost = (e) => {
    e.preventDefault();
    const n = parseInt(likeBoostValue, 10);
    if (!n || Number.isNaN(n)) {
      toast.error("Fadlan geli tiro sax ah.");
      return;
    }
    handleBoostLikes(n);
  };

  const handleResetBoost = async () => {
    if (!post.bonusLikes) return;
    await handleBoostLikes(-post.bonusLikes); // ku dar -bonusLikes = dib u dejin 0
  };

  // ---- Share (Share) ----
  // shareUrl: link-ga toos ah ee post-kan (leh #post.id si loo scroll-eeyo).
  // shareText: qoraalka la geynayo — hadduu post-ku qoraal lahaa, isku dar.
  const shareUrl = `${window.location.origin}/community#${post.id}`;
  const shareText = post.text?.trim()
    ? `${post.text.trim()}\n\n— University Imam University`
    : "Eeg boostadan University Imam University";
  const firstImage = media.find((m) => m.type !== "video");

  // Isku day inaan la Shareo SAWIRKA (file) sax ah, adiga oo isticmaalaya
  // Web Share API (level 2). Tani waa habka KELIYA ee browser-ku u ogolyahay
  // in file toos loogu daro OS share sheet-ka — WhatsApp/Telegram web
  // link-yadooda ma taageeraan attach-file.
  const tryShareWithFile = async () => {
    if (!firstImage?.url) return false;
    try {
      const res = await fetch(firstImage.url);
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      const file = new File([blob], `imam-university-post.${ext}`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Imam University",
          text: shareText,
          url: shareUrl,
        });
        return true;
      }
    } catch (err) {
      console.warn("Share-with-file failed, falling back:", err);
    }
    return false;
  };

  const handleShare = async () => {
    if (navigator.share) {
      setPreparingShare(true);
      try {
        const sharedWithFile = await tryShareWithFile();
        if (!sharedWithFile) {
          await navigator.share({ title: "Imam University", text: shareText, url: shareUrl });
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          toast.error("Wax qalad ah ayaa dhacay marka la Shareayay.");
        }
      } finally {
        setPreparingShare(false);
      }
      return;
    }
    setShareMenuOpen((v) => !v);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link-ga waa la koobiyeeyay!");
    } catch {
      toast.error("Wax qalad ah ayaa dhacay.");
    }
    setShareMenuOpen(false);
  };

  const openPlatform = (platformUrl) => {
    window.open(platformUrl, "_blank", "noopener,noreferrer,width=600,height=600");
    setShareMenuOpen(false);
  };

  const shareTargets = [
    {
      label: "WhatsApp",
      icon: WhatsAppIcon,
      color: "text-[#25D366]",
      onClick: () => openPlatform(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`),
    },
    {
      label: "Telegram",
      icon: TelegramIcon,
      color: "text-[#26A5E4]",
      onClick: () => openPlatform(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`),
    },
    {
      label: "Facebook",
      icon: FacebookIcon,
      color: "text-[#1877F2]",
      onClick: () => openPlatform(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`),
    },
    {
      label: "X",
      icon: XIcon,
      color: "text-navy-800",
      onClick: () => openPlatform(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`),
    },
  ];

  // Xir menu-yada (share + like-boost) marka la taabto meel ka baxsan.
  useEffect(() => {
    if (!shareMenuOpen && !likeBoostOpen) return;
    const onClickOutside = (e) => {
      if (shareMenuOpen && shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShareMenuOpen(false);
      }
      if (likeBoostOpen && likeBoostRef.current && !likeBoostRef.current.contains(e.target)) {
        setLikeBoostOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [shareMenuOpen, likeBoostOpen]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updatePostText(post.id, editText.trim());
      toast.success("Post-ka waa la cusboonaysiiyay!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Ma hubtaa inaad tirtirto post-kan?")) return;
    try {
      await deletePost(post.id);
      toast.success("Post-ka waa la tirtiray.");
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    }
  };

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i + 1) % media.length);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i - 1 + media.length) % media.length);
  };

  return (
    <article
      id={post.id}
      className={`relative rounded-xl border bg-white p-5 shadow-sm sm:p-6 ${
        post.pinned ? "border-gold-400 ring-1 ring-gold-300/60" : "border-navy-100"
      }`}
    >
      {/* Calaamadda Pin-ka — waxay ku muuqataa qofka DHAMMAAN, ma aha admin
          kaliya, si loo ogaado in post-kan Pined📌. */}
      {post.pinned && (
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gold-600">
          <Pin size={12} fill="currentColor" />
          Pined📌
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700">
            <img src={logo} alt="Imam University" className="h-full w-full object-cover" />
          </span>
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-navy-800">
              Imam University
              <BadgeCheck size={15} className="text-blue-500" fill="#3B82F6" stroke="white" />
            </p>
            <p className="text-xs text-navy-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {isAdmin && !isEditing && (
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={handleTogglePin}
              disabled={pinning}
              className={`rounded-md p-1.5 hover:bg-navy-50 disabled:opacity-50 ${
                post.pinned ? "text-gold-600" : "text-navy-400 hover:text-navy-700"
              }`}
              title={post.pinned ? "Ka saar Pin-ka" : "Taag (Pin) post-kan"}
            >
              {post.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <button
              onClick={() => {
                setEditText(post.text || "");
                setIsEditing(true);
              }}
              className="rounded-md p-1.5 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md p-1.5 text-navy-400 hover:bg-rose/10 hover:text-rose"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-gold-300 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="flex items-center gap-1 rounded-md bg-navy-700 px-3 py-1.5 text-xs font-semibold text-parchment disabled:opacity-60"
            >
              <Check size={12} />
              {saving ? "Kaydinaya..." : "Kaydi"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 rounded-md border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-500"
            >
              <X size={12} />
              Jooji
            </button>
          </div>
        </div>
      ) : (
        post.text && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {post.text}
          </p>
        )
      )}

      {visibleMedia.length > 0 && (
        <div className={`mt-4 grid gap-1.5 overflow-hidden rounded-lg ${mediaGridClass(visibleMedia.length)}`}>
          {visibleMedia.map((m, i) => {
            const isLastVisible = i === visibleMedia.length - 1 && extraCount > 0;
            return (
              <div
                key={i}
                className="relative aspect-square bg-navy-50 cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                {m.type === "video" ? (
                  <video src={m.url} controls className="h-full w-full object-cover" onClick={(e) => e.stopPropagation()} />
                ) : (
                  <img
                    src={m.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                {isLastVisible && (
                  <div className="absolute inset-0 flex items-center justify-center bg-navy-900/60 text-lg font-semibold text-white">
                    +{extraCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex items-center gap-1 border-t border-navy-50 pt-3">
        <div className="relative flex items-center" ref={likeBoostRef}>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              isLiked ? "text-rose" : "text-navy-500 hover:bg-navy-50"
            }`}
          >
            <Heart size={16} fill={isLiked ? "#B5545A" : "none"} />
            {totalLikes}
          </button>

          {/* Like-boost — admin-only, halkan uu ka gacan-galin karo tirada
              like-ga (waxaa kordhiya bonusLikes, dhabta ah ma taabanayo). */}
          {isAdmin && (
            <button
              onClick={() => setLikeBoostOpen((v) => !v)}
              disabled={boosting}
              className="ml-0.5 rounded-md p-1 text-navy-300 hover:bg-navy-50 hover:text-navy-600 disabled:opacity-50"
              title="U badal tirada like-ga"
            >
              <Plus size={12} />
            </button>
          )}

          {isAdmin && likeBoostOpen && (
            <div className="absolute left-0 top-full z-40 mt-1 w-56 rounded-lg border border-navy-100 bg-white p-3 shadow-lg">
              <p className="mb-2 text-xs font-semibold text-navy-700">
                Badal Tirada Like-ga
              </p>
              <div className="mb-2 flex gap-1.5">
                {[10, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleBoostLikes(n)}
                    disabled={boosting}
                    className="flex-1 rounded-md border border-navy-100 py-1 text-xs font-medium text-navy-600 hover:bg-navy-50 disabled:opacity-50"
                  >
                    +{n}
                  </button>
                ))}
              </div>
              <form onSubmit={handleCustomBoost} className="flex gap-1.5">
                <input
                  value={likeBoostValue}
                  onChange={(e) => setLikeBoostValue(e.target.value)}
                  type="number"
                  placeholder="Tiro (tusaale -5)"
                  className="w-full min-w-0 rounded-md border border-navy-100 px-2 py-1.5 text-xs outline-none focus:border-gold-400"
                />
                <button
                  type="submit"
                  disabled={boosting}
                  className="shrink-0 rounded-md bg-navy-700 px-2.5 py-1.5 text-xs font-semibold text-parchment disabled:opacity-50"
                >
                  Ku Dar
                </button>
              </form>
              {post.bonusLikes > 0 && (
                <button
                  onClick={handleResetBoost}
                  disabled={boosting}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-navy-100 py-1.5 text-xs font-medium text-navy-400 hover:bg-navy-50 disabled:opacity-50"
                >
                  <Minus size={11} />
                  Dib u deji ({post.bonusLikes})
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={openComments}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-navy-500 hover:bg-navy-50"
        >
          <MessageCircle size={16} />
          {post.commentCount || 0}
        </button>

        {/* Share: relative container si menu-ga desktop-ku halkan ugu dego */}
        <div className="relative ml-auto" ref={shareMenuRef}>
          <button
            onClick={handleShare}
            disabled={preparingShare}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-navy-500 hover:bg-navy-50 disabled:opacity-60"
          >
            <Share2 size={16} />
            {preparingShare ? "..." : "Share"}
          </button>

          {shareMenuOpen && (
            <div className="absolute right-0 top-full z-40 mt-1 w-52 rounded-lg border border-navy-100 bg-white p-1.5 shadow-lg">
              {shareTargets.map((t) => (
                <button
                  key={t.label}
                  onClick={t.onClick}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50"
                >
                  <t.icon className={t.color} />
                  {t.label}
                </button>
              ))}
              <div className="my-1 border-t border-navy-50" />
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50"
              >
                <Link2 size={16} className="text-navy-400" />
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {showComments && (
        <div className="mt-3 border-t border-navy-50 pt-3">
          {identity && (
            <div className="mb-3 flex items-center gap-2.5 rounded-md bg-navy-50/40 px-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700">
                {identity.photo ? (
                  <img src={identity.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-gold-300">
                    {identity.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </span>
              <div>
                <p className="flex items-center gap-1 text-xs font-semibold text-navy-700">
                  {identity.name}
                  {isVerifiedRole(identity.role) && (
                    <BadgeCheck size={12} className="text-blue-500" fill="#3B82F6" stroke="white" />
                  )}
                </p>
                {ROLE_LABEL[identity.role] && (
                  <p className="text-[10px] text-navy-400">{ROLE_LABEL[identity.role]}</p>
                )}
              </div>
            </div>
          )}

          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {comments.length === 0 && (
              <p className="text-xs text-navy-400">
                Weli faallo lama dhigin. Noqo kan ugu horreeya!
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5 rounded-md bg-navy-50/60 px-3 py-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700">
                  {c.authorPhoto ? (
                    <img src={c.authorPhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-gold-300">
                      {c.authorName?.[0]?.toUpperCase()}
                    </span>
                  )}
                </span>
                <div>
                  <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-navy-700">
                    {c.authorName}
                    {isVerifiedRole(c.authorRole) && (
                      <BadgeCheck size={12} className="text-blue-500" fill="#3B82F6" stroke="white" />
                    )}
                    {ROLE_LABEL[c.authorRole] && (
                      <span className="rounded-full bg-navy-100 px-1.5 py-0.5 text-[9px] font-semibold text-navy-500">
                        {ROLE_LABEL[c.authorRole]}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-navy-600">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Qor faallo..."
              className="flex-1 rounded-md border border-navy-100 px-3 py-2 text-xs outline-none focus:border-gold-400"
            />
            <button
              type="submit"
              className="rounded-md bg-navy-700 px-3 py-2 text-xs font-semibold text-parchment"
            >
              Dir
            </button>
          </form>
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {media.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {media[lightboxIndex]?.type === "video" ? (
            <video
              src={media[lightboxIndex].url}
              controls
              autoPlay
              className="max-h-[85vh] max-w-[90vw] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={media[lightboxIndex]?.url}
              alt=""
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {media.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {lightboxIndex + 1} / {media.length}
            </div>
          )}
        </div>
      )}
    </article>
  );
}