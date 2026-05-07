import React, { useEffect, useMemo, useState } from "react";
import { Lock, LogOut, Save, Inbox, Trash2, RefreshCw, Mail, ShieldCheck, FileEdit, AlertTriangle } from "lucide-react";
import { api, tokenStore } from "../api";
import { useToast } from "../hooks/use-toast";
import { useContent } from "../context/ContentContext";

const SECTIONS = [
  { key: "profile", label: "Profile", isArray: false },
  { key: "about", label: "About", isArray: false },
  { key: "skills", label: "Skills", isArray: true },
  { key: "projects", label: "Projects", isArray: true },
  { key: "experience", label: "Experience", isArray: true },
  { key: "education", label: "Education", isArray: true },
  { key: "certifications", label: "Certifications", isArray: true },
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) { setChecking(false); return; }
    api.adminMe()
      .then(() => { setAuthed(true); })
      .catch(() => { tokenStore.clear(); })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <Shell>
        <div className="mono text-[12px] text-[var(--text-dim)]">$ checking session...</div>
      </Shell>
    );
  }

  return (
    <Shell>
      {authed ? (
        <Dashboard onLogout={() => { tokenStore.clear(); setAuthed(false); }} />
      ) : (
        <Login onSuccess={() => setAuthed(true)} />
      )}
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen grid-bg">
      <header className="border-b border-[var(--line)] bg-[rgba(10,11,13,0.8)] backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 mono text-[12px] tracking-[0.14em] text-[var(--text)]">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            <span>ADMIN_CONSOLE // root@manoj</span>
          </div>
          <a href="/" className="mono text-[11px] text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">$ exit → /</a>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 lg:px-8 py-8">{children}</main>
    </div>
  );
}

function Login({ onSuccess }) {
  const { toast } = useToast();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { token } = await api.adminLogin(pw);
      tokenStore.set(token);
      toast({ title: "Authenticated", description: "Welcome back, Manoj." });
      onSuccess();
    } catch (err) {
      toast({
        title: "Auth failed",
        description: err?.response?.data?.detail || "Invalid password",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="block">
        <div className="block-header">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>SUDO_LOGIN</span>
          </div>
          <span>tty1</span>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="mono text-[12px] text-[var(--text-dim)]">
            <div>$ sudo -i</div>
            <div className="text-[var(--text-muted)]">[sudo] password for manoj:</div>
          </div>
          <input
            type="password"
            autoFocus
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="•••••••••••••"
            className="w-full bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none px-3.5 py-2.5 mono text-[13px] text-[var(--text)] rounded-sm transition-colors"
          />
          <button disabled={busy} type="submit" className="btn primary w-full justify-center disabled:opacity-60">
            {busy ? "AUTHENTICATING..." : "AUTHENTICATE"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("content");
  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Welcome, <span className="text-[var(--accent)]">Manoj</span>
        </h1>
        <div className="flex items-center gap-2">
          <TabBtn active={tab === "content"} onClick={() => setTab("content")} icon={<FileEdit className="w-3.5 h-3.5" />}>CONTENT</TabBtn>
          <TabBtn active={tab === "inbox"} onClick={() => setTab("inbox")} icon={<Inbox className="w-3.5 h-3.5" />}>INBOX</TabBtn>
          <button onClick={onLogout} className="btn"><LogOut className="w-3.5 h-3.5" /> LOGOUT</button>
        </div>
      </div>
      {tab === "content" ? <ContentEditor /> : <Messages />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick}
      className={`btn ${active ? "primary" : ""}`}>
      {icon} {children}
    </button>
  );
}

function ContentEditor() {
  const { refresh, ...content } = useContent();
  const [active, setActive] = useState("profile");
  const [drafts, setDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  // Initialise drafts from content
  useEffect(() => {
    const init = {};
    SECTIONS.forEach((s) => {
      init[s.key] = JSON.stringify(content[s.key] ?? (s.isArray ? [] : {}), null, 2);
    });
    setDrafts(init);
  }, [content.profile, content.about, content.skills, content.projects, content.experience, content.education, content.certifications]); // eslint-disable-line

  const setDraft = (key, val) => {
    setDrafts((d) => ({ ...d, [key]: val }));
    try {
      JSON.parse(val);
      setErrors((e) => ({ ...e, [key]: null }));
    } catch (err) {
      setErrors((e) => ({ ...e, [key]: err.message }));
    }
  };

  const save = async (key) => {
    if (errors[key]) return;
    let parsed;
    try { parsed = JSON.parse(drafts[key]); } catch (err) {
      setErrors((e) => ({ ...e, [key]: err.message })); return;
    }
    setBusy(true);
    try {
      await api.adminUpdate({ [key]: parsed });
      toast({ title: `Saved ${key}`, description: "Content updated successfully." });
      await refresh();
    } catch (err) {
      toast({ title: "Save failed", description: err?.response?.data?.detail || "Server error", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const activeSection = SECTIONS.find((s) => s.key === active);

  return (
    <div className="grid lg:grid-cols-12 gap-5">
      <div className="lg:col-span-3">
        <div className="block">
          <div className="block-header">
            <span>SECTIONS</span>
            <span>{SECTIONS.length}</span>
          </div>
          <div>
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`w-full text-left px-4 py-3 border-b border-[var(--line)] last:border-b-0 mono text-[12px] tracking-[0.1em] transition-colors flex items-center justify-between ${
                  active === s.key
                    ? "bg-[rgba(245,181,68,0.06)] text-[var(--accent)]"
                    : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.02)]"
                }`}
              >
                <span>{s.label.toUpperCase()}</span>
                {errors[s.key] && <AlertTriangle className="w-3.5 h-3.5 text-[#ef5a6f]" />}
              </button>
            ))}
          </div>
        </div>
        <div className="mono text-[10.5px] text-[var(--text-muted)] mt-3 leading-relaxed">
          # Edit JSON. Save per section.<br />
          # Skills/Projects/etc are arrays — preserve the shape.
        </div>
      </div>

      <div className="lg:col-span-9">
        <div className="block">
          <div className="block-header">
            <div className="flex items-center gap-2">
              <FileEdit className="w-3.5 h-3.5 text-[var(--accent-2)]" />
              <span>EDIT // {activeSection?.label}</span>
            </div>
            <span>{activeSection?.isArray ? "array" : "object"}</span>
          </div>
          <div className="p-5">
            <textarea
              spellCheck={false}
              value={drafts[active] || ""}
              onChange={(e) => setDraft(active, e.target.value)}
              className="w-full h-[60vh] bg-[#0c0d10] border border-[var(--line)] focus:border-[var(--accent)] outline-none px-4 py-3 mono text-[12.5px] leading-6 text-[var(--text)] rounded-sm resize-none transition-colors"
            />
            {errors[active] && (
              <div className="mt-3 mono text-[11.5px] text-[#ef5a6f] flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>JSON error: {errors[active]}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={refresh} className="btn"><RefreshCw className="w-3.5 h-3.5" /> RELOAD</button>
              <button
                onClick={() => save(active)}
                disabled={busy || !!errors[active]}
                className="btn primary disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {busy ? "SAVING..." : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Messages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.adminMessages();
      setItems(data);
    } catch (err) {
      toast({ title: "Could not load messages", description: err?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const remove = async (id) => {
    try {
      await api.adminDeleteMessage(id);
      setItems((arr) => arr.filter((m) => m.id !== id));
    } catch (err) {
      toast({ title: "Delete failed", description: err?.message || "", variant: "destructive" });
    }
  };

  return (
    <div className="block">
      <div className="block-header">
        <div className="flex items-center gap-2">
          <Inbox className="w-3.5 h-3.5 text-[var(--accent-2)]" />
          <span>UART_RX // /var/mail/manoj</span>
        </div>
        <button onClick={load} className="mono text-[10.5px] text-[var(--text-dim)] hover:text-[var(--accent)]">$ refresh</button>
      </div>
      {loading ? (
        <div className="p-6 mono text-[12px] text-[var(--text-dim)]">$ tail -f mailbox...</div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center mono text-[12px] text-[var(--text-muted)]">
          # inbox empty — no incoming packets yet
        </div>
      ) : (
        <div className="divide-y divide-[var(--line)]">
          {items.map((m) => (
            <div key={m.id} className="p-5 hover:bg-[rgba(255,255,255,0.015)]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="mono text-[10.5px] tracking-[0.14em] text-[var(--text-muted)]">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                  <div className="text-[var(--text)] font-medium mt-0.5">{m.name}</div>
                  <a href={`mailto:${m.email}`} className="mono text-[12px] text-[var(--accent-2)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> {m.email}
                  </a>
                </div>
                <button
                  onClick={() => remove(m.id)}
                  className="mono text-[10.5px] text-[var(--text-dim)] hover:text-[#ef5a6f] border border-[var(--line)] hover:border-[#ef5a6f] px-2.5 py-1 rounded-sm flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> DELETE
                </button>
              </div>
              <pre className="mt-3 text-[var(--text-dim)] text-[13.5px] leading-relaxed whitespace-pre-wrap font-sans">
                {m.message}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
