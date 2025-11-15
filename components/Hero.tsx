'use client';
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="text-center space-y-6 sm:space-y-8">
      <motion.div
        className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-background/60 px-3 py-1 text-sm text-foreground/70"
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
      <motion.div
        className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
      >
        <a
          href="/signup"
          aria-disabled="false"
          title="Become a member"
          className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-background font-medium px-5 transition hover:opacity-90 active:opacity-80"
        >
          Join the community
        </a>
      </motion.div>
      <motion.div
        className="mt-2 flex justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.22 }}
      >
        <span className="whitespace-nowrap text-sm text-foreground/70">
          Already a member?
          <a
            href="/signin"
            title="Sign in"
            className="ml-1 text-sm text-foreground underline hover:opacity-80"
          >
            Sign in
          </a>
        </span>
      </motion.div>
    </div>
  );
}

