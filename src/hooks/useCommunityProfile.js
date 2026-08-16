// src/hooks/useCommunityProfile.js
//
// A lightweight, device-local "who is this visitor" profile for the
// PUBLIC community page. Unlike useAuth() (which is for logged-in
// admin/teacher/student portal users), this is for anonymous visitors
// on /community who just want to like/comment/share without a full
// account. Asked once, stored in localStorage, reused forever after.
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "imam_community_profile";

function readProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function makeId() {
  return "guest-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useCommunityProfile() {
  const [profile, setProfile] = useState(() => readProfile());

  const saveProfile = useCallback(({ name, photo }) => {
    const existing = readProfile();
    const next = {
      id: existing?.id || makeId(),
      name: name?.trim() || "Isticmaale",
      photo: photo || existing?.photo || "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
    return next;
  }, []);

  return { profile, saveProfile, hasProfile: !!profile };
}