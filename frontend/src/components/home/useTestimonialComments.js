import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'centrehub-testimonials';

const loadComments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveComments = (comments) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  } catch {
    /* ignore quota errors */
  }
};

export const useTestimonialComments = () => {
  const [userComments, setUserComments] = useState([]);

  useEffect(() => {
    setUserComments(loadComments());
  }, []);

  const addComment = useCallback(({ name, role, quote, userId }) => {
    const entry = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name: name.trim(),
      role: role || '',
      quote: quote.trim(),
      userId: userId || null,
      createdAt: Date.now(),
    };

    setUserComments((prev) => {
      const next = [entry, ...prev];
      saveComments(next);
      return next;
    });

    return entry;
  }, []);

  return { userComments, addComment };
};
