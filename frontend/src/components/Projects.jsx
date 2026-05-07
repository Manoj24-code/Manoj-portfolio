import React, { useState } from "react";
import { useContent } from "../context/ContentContext";
import BinaryStream from "./BinaryStream";
import { ArrowUpRight, Cpu, Github, ExternalLink } from "lucide-react";

export default function Projects() {
  const { projects } = useContent();
  const [hover, setHover] = useState(null);
  return (
    <section id="projects" className="relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] mb-2">
              // 0x30 &mdash; IO_MODULES
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Project <span className="text-[var(--accent)]">modules</span>
            </h2>
          </div>
          <div className="mono text-[11px] text-[var(--text-dim)]">
            $ ls ./projects &mdash; {projects.length.toString().padStart(2, "0")} modules
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p, idx) => (
            <div
              key={p.id}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(null)}
              className="block group relative"
            >
              <div className="block relative p-5 h-full flex flex-col">
                <span className="pin left" style={{ top: "25%" }} />
                <span className="pin left" style={{ top: "55%" }} />
                <span className="pin right" style={{ top: "25%" }} />
                <span className="pin right" style={{ top: "55%" }} />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[var(--accent-2)]" />
                    <span className="mono text-[10.5px] tracking-[0.14em] text-[var(--text-muted)]">
                      {p.id} // {p.role}
                    </span>
                  </div>
                  <span className="mono text-[10.5px] text-[var(--text-muted)]">{p.year}</span>
                </div>

                <h3 className="text-lg font-semibold text-[var(--text)] leading-snug">
                  {p.title}
                </h3>
                <p className="text-[var(--text-dim)] text-[13.5px] leading-relaxed mt-2 flex-1">
                  {p.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {p.stack.map((s) => (
                    <span key={s} className="chip">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-dashed border-[var(--line)]">
                  <span className="mono text-[10px] text-[var(--text-muted)] tracking-[0.15em]">
                    {hover === idx ? "STATUS: RX" : "STATUS: IDLE"}
                  </span>
                  <div className="flex items-center gap-2">
                    {p.repo && (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mono text-[10.5px] tracking-[0.1em] text-[var(--text-dim)] hover:text-[var(--accent)] border border-[var(--line)] hover:border-[var(--accent)] px-2 py-1 rounded-sm transition-colors"
                      >
                        <Github className="w-3 h-3" /> REPO
                      </a>
                    )}
                    {p.demo && (
                      <a
                        href={p.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mono text-[10.5px] tracking-[0.1em] text-[var(--text-dim)] hover:text-[var(--accent-2)] border border-[var(--line)] hover:border-[var(--accent-2)] px-2 py-1 rounded-sm transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> DEMO
                      </a>
                    )}
                    {!p.repo && !p.demo && (
                      <span className="mono text-[10px] text-[var(--text-muted)]">
                        <ArrowUpRight className="w-3.5 h-3.5 inline" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <BinaryStream direction="rtl" label="DATA_BUS_3 → EXPERIENCE" />
        </div>
      </div>
    </section>
  );
}
