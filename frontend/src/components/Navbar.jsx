import React, { useEffect, useState } from "react";
import { useContent } from "../context/ContentContext";
import { Cpu, Github, Linkedin } from "lucide-react";

export default function Navbar() {
  const { profile, navItems } = useContent();
  const [active, setActive] = useState("core");
  const [clk, setClk] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setClk((c) => (c + 1) % 1000), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY + 120;
      let current = "core";
      for (const n of navItems) {
        const el = document.getElementById(n.id);
        if (el && el.offsetTop <= y) current = n.id;
      }
      setActive(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[rgba(10,11,13,0.72)] border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
        <button
          onClick={() => scrollTo("core")}
          className="flex items-center gap-2.5 group"
        >
          <Cpu className="w-4 h-4 text-[var(--accent)]" />
          <span className="mono text-[12px] tracking-[0.15em] text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
            {profile.name.replace(/\s+/g, "_").toUpperCase()}
          </span>
          <span className="mono text-[10px] text-[var(--text-muted)] hidden sm:inline">
            // v1.0.0
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`mono text-[11px] tracking-[0.12em] px-3 py-1.5 rounded-sm transition-colors ${
                active === n.id
                  ? "text-[var(--accent)] bg-[rgba(245,181,68,0.08)]"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              <span className="text-[var(--text-muted)] mr-1.5">{n.addr}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mono text-[10px] text-[var(--text-muted)]">
            <span className="led" />
            <span>CLK {String(clk).padStart(3, "0")}</span>
          </div>
          <a href={profile.github} target="_blank" rel="noreferrer" className="text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
