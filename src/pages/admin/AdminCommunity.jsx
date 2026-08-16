// src/pages/admin/AdminCommunity.jsx
//
// This is the ADMIN-ONLY community page (/admin/community). It is
// completely separate from the public Community.jsx (/community):
// - No ProfileGate here — the admin's identity comes only from
//   useAuth() (they're already logged in as admin).
// - Has the PostComposer, so the admin can write posts with text and
//   upload multiple images/videos.
// - PostCard here gets no `hideActions`, so edit/delete controls show
//   for the admin on every post.
import { useEffect, useState } from "react";
import { subscribeToPosts } from "../../firebase/posts";
import PostComposer from "../../components/PostComposer";
import PostCard from "../../components/PostCard";
import { Megaphone } from "lucide-react";

export default function AdminCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPosts((data) => {
      setPosts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-gold-400">
          <Megaphone size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">
            Post
          </h1>
          <p className="text-xs text-navy-400">
            Halkan ayaad ka dhajin kartaa post-yada Post — qoraal, sawir
            iyo muuqaal.
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-2xl space-y-8">
        <PostComposer />

        {loading && (
          <p className="text-center text-sm text-navy-400">Soo dejinaya...</p>
        )}

        {!loading && posts.length === 0 && (
          <div className="rounded-lg border border-dashed border-navy-200 py-16 text-center">
            <p className="text-sm text-navy-400">
              Weli wax post ah lama dhigin.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}