//src/firebase/post.js
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";
import { COLLECTIONS } from "./collections";

export function subscribeToPosts(callback) {
  const q = query(
    collection(db, COLLECTIONS.POSTS),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function uploadWithTimeout(file, path, ms = 20000) {
  const storageRef = ref(storage, path);
  const uploadPromise = uploadBytes(storageRef, file).then((snapshot) =>
    getDownloadURL(snapshot.ref)
  );
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Upload wuu qaatay wakhti dheer (${file.name}) — hubi Storage Rules ama internet-ka.`)),
      ms
    )
  );
  return Promise.race([uploadPromise, timeoutPromise]);
}

export async function createPost({ authorId, authorName, authorRole, text, files }) {
  let media = [];

  if (files && files.length > 0) {
    media = await Promise.all(
      files.map(async (file) => {
        const safeName = sanitizeFilename(file.name);
        const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
        const url = await uploadWithTimeout(file, path);
        return { url, type: file.type.startsWith("video") ? "video" : "image" };
      })
    );
  }

  await addDoc(collection(db, COLLECTIONS.POSTS), {
    authorId,
    authorName,
    authorRole,
    text,
    media,
    likes: [],
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function updatePostText(postId, text) {
  await updateDoc(doc(db, COLLECTIONS.POSTS, postId), { text });
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, COLLECTIONS.POSTS, postId));
}

export async function toggleLike(postId, uid, isLiked) {
  const ref = doc(db, COLLECTIONS.POSTS, postId);
  await updateDoc(ref, {
    likes: isLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
}

export function subscribeToComments(postId, callback) {
  const q = query(
    collection(db, COLLECTIONS.POSTS, postId, "comments"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
// Ku-darid: src/firebase/posts.js
// Fadlan hubi in db iyo doc/updateDoc/increment horeba laga soo import gareeyay
// faylkan (sida functions-ka kale ee toggleLike, updatePostText isticmaalaan).

// PIN — admin ayaa toos u boggeeya post-ka feed-ka. `pinned` waa boolean,
// `pinnedAt` waxaan u kaydinnaa serverTimestamp si loo ogaado goorma la
// taagay (haddii mar dambe la rabo tallaabo sida "kan ugu dambeeyay pinned").
export async function setPostPinned(postId, pinned) {
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, {
    pinned,
    pinnedAt: pinned ? serverTimestamp() : null,
  });
}

// LIKE BOOST — waxay kordhisaa (ama dhimaysaa haddii amount negative yahay)
// field-ka `bonusLikes`, oo ku daraya total-ka like-ga la muujinayo, iyada
// oo aan taaban array-ka `likes` (kaas oo weli ka mas'uul ah toggle-like-ka
// dhabta ah ee users-ka).
export async function adjustBonusLikes(postId, amount) {
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, {
    bonusLikes: increment(amount),
  });
}
// Comment now also carries the commenter's photo (data URL or empty
// string) alongside their name, so their avatar shows next to every
// comment they leave — sourced from the visitor's local community
// profile (see useCommunityProfile), not re-asked per comment.
export async function addComment(postId, { authorName, authorPhoto, authorRole, text }) {
  await addDoc(collection(db, COLLECTIONS.POSTS, postId, "comments"), {
    authorName,
    authorPhoto: authorPhoto || "",
    authorRole: authorRole || "user",
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTIONS.POSTS, postId), {
    commentCount: increment(1),
  });
}