import type { Metadata } from "next";
import "./globals.css";

// Fonts are provided via system fallbacks defined in globals.css.

export const metadata: Metadata = {
  title: "Joetechgeek Foundation — Software Engineering School",
  description:
    "We nurture software developers and engineers. Submit projects, join our community, and grow through mentorship.",
  keywords: [
    "Joetechgeek Foundation",
    "Software Engineering School",
    "Mentorship",
    "Projects",
    "Community",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
