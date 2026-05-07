import React from "react";
import { useContent } from "../context/ContentContext";
import BinaryStream from "./BinaryStream";
import { BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";

export default function Certifications() {
  const { certifications } = useContent();
  return (
    <section id="certifications" className="relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] mb-2">
              // 0x60 &mdash; SIGNED_CERTS
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Verified <span className="text-[var(--accent-2)]">signatures</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mono text-[11px] text-[var(--text-dim)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> $ gpg --verify
          </div>
        </div>

        <div className="block">
          <div className="block-header">
            <div className="flex items-center gap-2">
              <span className="block-title-dot" />
              <span>/var/log/certs.d/</span>
            </div>
            <span>{certifications.length.toString().padStart(2, "0")} entries</span>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {certifications.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 hover:bg-[rgba(245,181,68,0.03)] transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-8 h-8 rounded-sm border border-[var(--line-strong)] bg-[var(--bg-elev)] flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="mono text-[10px] tracking-[0.15em] text-[var(--text-muted)]">
                      {c.id} • {c.date}
                    </div>
                    <div className="text-[var(--text)] text-[15px] font-medium mt-0.5 truncate">
                      {c.name}
                    </div>
                    <div className="mono text-[11.5px] text-[var(--text-dim)] mt-0.5">
                      issuer: <span className="text-[var(--accent-2)]">{c.issuer}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 md:pl-4">
                  <span className="mono text-[10.5px] text-[var(--text-muted)] truncate max-w-[180px]">
                    id: {c.credentialId}
                  </span>
                  <span className="inline-flex items-center gap-1.5 mono text-[10.5px] tracking-[0.1em] text-[var(--text-dim)] group-hover:text-[var(--accent)] border border-[var(--line)] group-hover:border-[var(--accent)] px-2.5 py-1 rounded-sm transition-colors">
                    VERIFY <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <BinaryStream label="DATA_BUS_6 → I/O" speed="fast" />
        </div>
      </div>
    </section>
  );
}
