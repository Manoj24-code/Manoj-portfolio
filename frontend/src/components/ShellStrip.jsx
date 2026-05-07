import React, { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

// Rotating fake Linux shell commands displayed in a thin strip beneath the hero
const COMMANDS = [
  { cmd: "uname -a", out: "Linux portfolio 6.5.0-embedded #1 SMP PREEMPT_RT aarch64 GNU/Linux" },
  { cmd: "whoami", out: "embedded-engineer" },
  { cmd: "cat /proc/cpuinfo | grep Hardware", out: "Hardware : ARM Cortex-M + Cortex-A72" },
  { cmd: "ls /dev/tty*", out: "/dev/ttyUSB0  /dev/ttyS1  /dev/ttyACM0" },
  { cmd: "systemctl status curiosity.service", out: "active (running) — since boot; 24/7" },
  { cmd: "dmesg | tail -1", out: "[   42.007] firmware: shipped v2.1.0 successfully" },
];

export default function ShellStrip() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % COMMANDS.length), 3200);
    return () => clearInterval(id);
  }, []);
  const c = COMMANDS[i];
  return (
    <div className="border-y border-[var(--line)] bg-[var(--bg-elev)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-2.5 flex items-center gap-4 mono text-[11.5px] overflow-hidden">
        <div className="flex items-center gap-2 text-[var(--text-muted)] shrink-0">
          <Terminal className="w-3.5 h-3.5 text-[var(--accent-2)]" />
          <span>user@portfolio:~</span>
          <span className="text-[var(--accent)]">$</span>
        </div>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-[var(--text)] shrink-0">{c.cmd}</span>
          <span className="text-[var(--text-muted)]">→</span>
          <span className="text-[var(--text-dim)] truncate">{c.out}</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[var(--text-muted)] shrink-0">
          <span className="led" />
          <span>PID 0x{(1000 + i * 7).toString(16).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
