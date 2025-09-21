// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright and credits */}
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-400">
              © 2025{" "}
              <Link
                href="https://natasatm.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-indigo-200 transition-colors duration-200 font-medium"
              >
                Nataša Todorov Marković
              </Link>
              . Built for educational purposes.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Next.js + NextAuth.js + Keycloak Tutorial
            </p>
          </div>

          {/* Links section */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <Link
              href="https://natasatm.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-300 transition-colors duration-200"
            >
              Portfolio
            </Link>
            <Link
              href="https://github.com/NatasaTM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-300 transition-colors duration-200"
            >
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/natasa-todorov-markovic-91172952/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-300 transition-colors duration-200"
            >
              LinkedIn
            </Link>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              This is a demo application showcasing NextAuth.js integration with Keycloak OIDC.
            </p>
            <p>
              Built with Next.js 15, TypeScript, and Tailwind CSS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
