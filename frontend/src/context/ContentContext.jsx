import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";
import * as mock from "../mock";

const defaultContent = {
  profile: mock.profile,
  about: mock.about,
  skills: mock.skills,
  projects: mock.projects,
  experience: mock.experience,
  education: mock.education,
  certifications: mock.certifications,
};

const ContentCtx = createContext({
  ...defaultContent,
  loading: true,
  error: null,
  refresh: async () => {},
});

export function ContentProvider({ children }) {
  const [data, setData] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getContent();
      setData({
        profile: res.profile || defaultContent.profile,
        about: res.about || defaultContent.about,
        skills: res.skills || defaultContent.skills,
        projects: res.projects || defaultContent.projects,
        experience: res.experience || defaultContent.experience,
        education: res.education || defaultContent.education,
        certifications: res.certifications || defaultContent.certifications,
      });
      setError(null);
    } catch (e) {
      console.warn("Content load failed, using mock fallback", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ContentCtx.Provider value={{ ...data, loading, error, refresh, navItems: mock.navItems }}>
      {children}
    </ContentCtx.Provider>
  );
}

export function useContent() {
  return useContext(ContentCtx);
}
