import React from "react";
import { useContent } from "../context/ContentContext";
import { Cpu } from "lucide-react";

export default function Footer() {
  const { profile } = useContent();
  return (
    <footer className="border-t border-[var(--line)] mt-10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 mono text-[11px] tracking-[0.14em] text-[var(--text-muted)]">
          <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{profile.name.replace(/\s+/g, "_").toUpperCase()} // shutdown -h now</span>
        </div>
        <div className="mono text-[10.5px] text-[var(--text-muted)] tracking-[0.12em]">
          © {new Date().getFullYear()} • built with C, coffee, Linux and a soldering iron
        </div>
        <div className="mono text-[10.5px] text-[var(--text-muted)] tracking-[0.12em]">
          GND • VCC • SCK • MISO
        </div>
      </div>
    </footer>
  );
}
