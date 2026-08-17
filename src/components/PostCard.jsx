//src/component/PostCard.jsx 
import { useState } from "react";
import { Heart, MessageCircle, Share2, Pencil, Trash2, Check, X, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { toggleLike, subscribeToComments, addComment, updatePostText, deletePost } from "../firebase/posts";
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

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadedComments, setLoadedComments] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [saving, setSaving] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  const handleShare = async () => {
    const url = `${window.location.origin}/community#${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link-ga waa la koobiyeeyay!");
    } catch {
      toast.error("Wax qalad ah ayaa dhacay.");
    }
  };

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
      className="relative rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6"
    >
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
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            isLiked ? "text-rose" : "text-navy-500 hover:bg-navy-50"
          }`}
        >
          <Heart size={16} fill={isLiked ? "#B5545A" : "none"} />
          {post.likes?.length || 0}
        </button>
        <button
          onClick={openComments}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-navy-500 hover:bg-navy-50"
        >
          <MessageCircle size={16} />
          {post.commentCount || 0}
        </button>
        <button
          onClick={handleShare}
          className="ml-auto flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-navy-500 hover:bg-navy-50"
        >
          <Share2 size={16} />
          Wadaag
        </button>
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