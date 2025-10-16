 'use client';
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

export default function Home() {
  // Types
  type LinkType = 'Auto' | 'GitHub' | 'CodeSandbox' | 'Website' | 'App Store' | 'Other';
  type SavedLink = {
    id: string;
    url: string;
    type: Exclude<LinkType, 'Auto'>;
    title: string;
    description: string;
  };

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<{ url: string; type: LinkType; title: string; description: string; }>(
    {
      url: "",
      type: "Auto",
      title: "",
      description: "",
    }
  );
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helpers
  const detectType = useMemo(() => {
    return (url: string): Exclude<LinkType, 'Auto'> => {
      if (/github\.com/i.test(url)) return 'GitHub';
      if (/codesandbox\.io/i.test(url)) return 'CodeSandbox';
      if (/(apps\.apple\.com|play\.google\.com)/i.test(url)) return 'App Store';
      return 'Website';
    };
  }, []);

  const prettyHostname = (u: string) => {
    try {
      return new URL(u).hostname.replace(/^www\./i, "");
    } catch {
      return "link";
    }
  };

  const badgeColor = (t: string) => {
    switch (t) {
      case 'GitHub':
        return 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black';
      case 'CodeSandbox':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300';
      case 'App Store':
        return 'bg-blue-600/15 text-blue-700 dark:text-blue-300';
      case 'Website':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-300';
      default:
        return 'bg-foreground/10 text-foreground/80';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let parsed: URL;
    try {
      parsed = new URL(form.url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error('Only http(s) links are allowed');
    } catch {
      setError('Please provide a valid http(s) URL');
      return;
    }

    const resolved = form.type === 'Auto' ? detectType(form.url) : (form.type as Exclude<LinkType, 'Auto'>);
    const title =
      form.title.trim() ||
      `${prettyHostname(form.url)}${parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : ''}`;

    const newLink: SavedLink = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: form.url.trim(),
      type: resolved,
      title,
      description: form.description.trim().slice(0, 240),
    };

    setLinks((prev) => [newLink, ...prev].slice(0, 6));
    setIsModalOpen(false);
    setForm({ url: '', type: 'Auto', title: '', description: '' });
  };

  return (
    <main className="font-sans min-h-screen flex flex-col">
      <section className="relative flex-1 min-h-screen min-h-[100svh] md:min-h-[100dvh] flex items-center justify-center overflow-hidden px-6 py-12 sm:py-16">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"
            initial={{ y: 0, scale: 1 }}
            animate={{ y: [-6, 6, -6], scale: [1, 1.02, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
            initial={{ y: 0, scale: 1 }}
            animate={{ y: [6, -6, 6], scale: [1, 1.03, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          {/* Copy */}
          <div className="text-center md:text-left space-y-6 sm:space-y-8">
            <motion.div
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-background/60 px-3 py-1 text-sm text-foreground/70"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span>Design</span>
              <span className="opacity-40">•</span>
              <span>Code</span>
              <span className="opacity-40">•</span>
              <span>Deploy</span>
            </motion.div>
            <motion.h1
              className="text-balance text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            >
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                Joetechgeek Foundation
              </span>
            </motion.h1>
            <motion.p
              className="text-balance text-lg sm:text-xl md:text-2xl text-foreground/80"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
            >
              Producing world-class software engineers
            </motion.p>
            {/* Submission card moved to the right column */}

              <motion.div
                className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
              >
                <a
                  href="#"
                  aria-disabled="false"
                  title="Become a member"
                  className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-background font-medium px-5 transition hover:opacity-90 active:opacity-80"
                >
                  Join the community
                </a>
              </motion.div>
              <motion.div
                className="mt-2 flex justify-center md:justify-start"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.22 }}
              >
                <span className="whitespace-nowrap text-sm text-foreground/70">
                  Already a member?
                  <a
                    href="#"
                    title="Sign in"
                    className="ml-1 text-sm text-foreground underline hover:opacity-80"
                  >
                    Sign in
                  </a>
                </span>
              </motion.div>
            </div>


          {/* Link submissions (no uploads) */}
          <motion.div
            className="relative mx-auto md:mx-0 w-full max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="rounded-2xl border border-black/10 dark:border-white/15 p-5 sm:p-6 bg-background/70 backdrop-blur-sm shadow-lg">
              <h3 className="text-xl font-semibold tracking-tight mb-1">Share your work</h3>
              <p className="text-sm text-foreground/70 mb-4">
                Add GitHub repos, CodeSandbox demos, websites, or app store pages. 
              </p>

              <div className="grid">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="h-12 rounded-xl bg-foreground text-background font-medium px-5 transition hover:opacity-90 active:opacity-80"
                >
                  Share a link
                </button>
              </div>

              {links.length > 0 && (
                <div className="mt-4 space-y-3">
                  {links.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-black/10 dark:border-white/15 p-3 flex items-start gap-3"
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-lg grid place-items-center text-xs font-medium ${badgeColor(item.type)}`}>
                        {item.type[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.title}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${badgeColor(item.type)}`}>{item.type}</span>
                        </div>
                        <p className="text-sm text-foreground/70 mt-0.5">
                          {item.description || "No description provided."}
                        </p>
                        <div className="text-xs text-foreground/60 mt-1 break-all">{item.url}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <AnimatePresence>
              {isModalOpen && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                  />
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-link-title"
                    className="relative z-10 w-full max-w-lg rounded-2xl border border-black/10 dark:border-white/15 bg-background p-6 shadow-xl"
                    initial={{ y: 24, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 24, opacity: 0, scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 id="add-link-title" className="text-lg font-semibold">
                        Share a link
                      </h4>
                      <button
                        className="h-8 w-8 grid place-items-center rounded-md border border-black/10 dark:border-white/15 hover:bg-foreground/5"
                        aria-label="Close"
                        onClick={() => setIsModalOpen(false)}
                      >
                        <span className="text-xl leading-none">&times;</span>
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">URL</label>
                        <input
                          type="url"
                          required
                          placeholder="https://github.com/your/repo"
                          value={form.url}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, url: e.target.value }));
                            setError(null);
                          }}
                          className="mt-1 w-full h-11 rounded-xl border border-black/10 dark:border-white/15 bg-background/60 px-3 outline-none focus:border-foreground/40"
                        />
                        {error && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <select
                            value={form.type}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, type: e.target.value as LinkType }))
                            }
                            className="mt-1 w-full h-11 rounded-xl border border-black/10 dark:border-white/15 bg-background/60 px-3"
                          >
                            <option>Auto</option>
                            <option>GitHub</option>
                            <option>CodeSandbox</option>
                            <option>Website</option>
                            <option>App Store</option>
                            <option>Other</option>
                          </select>
                          {form.type === 'Auto' && form.url && (
                            <p className="mt-1 text-xs text-foreground/60">
                              Detected: {detectType(form.url)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <input
                            type="text"
                            placeholder="Short title (optional)"
                            value={form.title}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, title: e.target.value }))
                            }
                            className="mt-1 w-full h-11 rounded-xl border border-black/10 dark:border-white/15 bg-background/60 px-3"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Brief description</label>
                        <textarea
                          rows={3}
                          maxLength={240}
                          placeholder="What is this link about?"
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, description: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-background/60 px-3 py-2 resize-none"
                        />
                        <p className="mt-1 text-xs text-foreground/60">
                          {Math.max(0, 240 - form.description.length)} characters left
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          className="h-10 rounded-lg border border-black/10 dark:border-white/15 px-4 hover:bg-foreground/5"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="h-10 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-background font-medium px-4"
                        >
                          Save link
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

