import React, { useState } from "react";
import { useContent } from "../context/ContentContext";
import { Mail, Github, Linkedin, Send, Check, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { api } from "../api";

export default function Contact() {
  const { profile } = useContent();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.sendMessage(form);
      setSent(true);
      toast({
        title: "TX_COMPLETE // packet ack'd",
        description: `Message stored on UART_RX. I'll reply to ${form.email} soon.`,
      });
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 2800);
    } catch (err) {
      toast({
        title: "TX_FAILED // CRC error",
        description: err?.response?.data?.detail || "Could not deliver message. Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] mb-2">
              // 0x50 — IO_COMM_PORT
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Open a <span className="text-[var(--accent)]">serial link</span>
            </h2>
            <p className="text-[var(--text-dim)] text-[15px] leading-relaxed mt-4 max-w-md">
              Transmit a message on my inbound UART. I read it, parse it, and reply at 115200 baud — usually within a day.
            </p>

            <div className="mt-8 space-y-3">
              <ContactRow icon={<Mail className="w-3.5 h-3.5" />} label="EMAIL" value={profile.email} href={`mailto:${profile.email}`} />
              <ContactRow icon={<Github className="w-3.5 h-3.5" />} label="GITHUB" value={profile.github.replace("https://", "")} href={profile.github} />
              <ContactRow icon={<Linkedin className="w-3.5 h-3.5" />} label="LINKEDIN" value={profile.linkedin.replace("https://", "")} href={profile.linkedin} />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="block">
              <div className="block-header">
                <div className="flex items-center gap-2">
                  <span className="block-title-dot cyan" />
                  <span>UART_TX // compose packet</span>
                </div>
                <span className="mono text-[10.5px] text-[var(--text-muted)]">115200 8N1</span>
              </div>
              <form onSubmit={onSubmit} className="p-6 lg:p-8 space-y-5">
                <Field label="FROM_NAME">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none px-3.5 py-2.5 mono text-[13px] text-[var(--text)] rounded-sm transition-colors"
                  />
                </Field>
                <Field label="FROM_EMAIL">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none px-3.5 py-2.5 mono text-[13px] text-[var(--text)] rounded-sm transition-colors"
                  />
                </Field>
                <Field label="PAYLOAD">
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="// write your message here"
                    className="w-full bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none px-3.5 py-2.5 mono text-[13px] text-[var(--text)] rounded-sm resize-none transition-colors"
                  />
                </Field>
                <div className="flex items-center justify-between">
                  <div className="mono text-[10.5px] text-[var(--text-muted)]">
                    CRC-16/CCITT • tx-buffer ok
                  </div>
                  <button type="submit" disabled={busy} className="btn primary disabled:opacity-60">
                    {sent ? (
                      <><Check className="w-3.5 h-3.5" /> SENT</>
                    ) : busy ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> TX...</>
                    ) : (
                      <>TRANSMIT <Send className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mono text-[10.5px] tracking-[0.15em] text-[var(--text-muted)] mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactRow({ icon, label, value, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between p-3.5 border border-[var(--line)] rounded-sm hover:border-[var(--accent)] transition-colors group"
    >
      <div className="flex items-center gap-3 text-[var(--text-dim)] group-hover:text-[var(--accent)]">
        {icon}
        <span className="mono text-[10.5px] tracking-[0.15em]">{label}</span>
      </div>
      <span className="mono text-[12.5px] text-[var(--text)] truncate ml-4">{value}</span>
    </a>
  );
}
