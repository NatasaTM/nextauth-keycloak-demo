"use client";

import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <section className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="text-center max-w-4xl mx-auto">
        {/* Main heading */}
        <h1 className="text-7xl md:text-8xl font-extrabold text-white mb-6 tracking-tight">
          Welcome <span className="align-middle text-6xl md:text-7xl">👋</span>
        </h1>

        {/* Subtitle */}
        <p className="text-3xl md:text-4xl text-slate-200 mb-12 font-light">
          This is a{" "}
          <span className="font-semibold text-indigo-300 bg-indigo-950/30 px-3 py-1 rounded-lg">
            public
          </span>{" "}
          home page.
        </p>

        {/* Info box with CTA */}
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8">
            Try the protected App. If you are not authenticated,
            you’ll be redirected to Keycloak.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* CTA button → starts signIn flow */}
            <button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl: "/app" })}
              className="
                px-6 py-3 rounded-xl font-semibold text-lg
                bg-indigo-600 text-white shadow-lg
                hover:bg-indigo-700 active:bg-indigo-800
                transition-colors duration-200
                cursor-pointer focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
              "
              title="Go to App"
            >
              Go to App
            </button>

            {/* Secondary link style */}
            <button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl: "/app" })}
              className="
                px-6 py-3 rounded-xl font-semibold text-lg
                bg-slate-800 text-slate-200 shadow-lg
                hover:bg-slate-700 active:bg-slate-800
                transition-colors duration-200
                cursor-pointer focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
              "
              title="Login with Keycloak"
            >
              Login with Keycloak
            </button>
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">🔐 Secure</h3>
            <p className="text-slate-400 text-sm">
              Protected routes with NextAuth.js + Keycloak
            </p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">⚡ Fast</h3>
            <p className="text-slate-400 text-sm">Built with Next.js 15</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">🎨 Modern</h3>
            <p className="text-slate-400 text-sm">Beautiful gradient design</p>
          </div>
        </div>
      </div>
    </section>
  );
}
