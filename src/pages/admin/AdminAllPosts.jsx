import { useEffect, useState } from "react";
import { subscribeToPosts } from "../../firebase/posts";
import PostCard from "../../components/PostCard";
import { MessagesSquare } from "lucide-react";

// Admin-only view of every post — reuses PostCard as-is (no hideActions),
// so the same edit/delete buttons that appear in /admin/community also
// work here. Deleting a post here removes it from Firestore, so it
// disappears from Home and the public Community page too, since they
// all read from the same subscribeToPosts() feed.
export default function AdminAllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-gold-400">
          <MessagesSquare size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">
            All Posts
          </h1>
          <p className="text-xs text-navy-400">
            Dhammaan post-yada Post — edit ama delete halkan.
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
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