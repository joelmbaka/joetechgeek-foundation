 'use client';
import { motion } from "framer-motion";
import Hero from "@/components/Hero";

export default function Home() {
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

        <div className="w-full max-w-4xl flex items-center justify-center">
          <Hero />
        </div>
      </section>
    </main>
  );
}

