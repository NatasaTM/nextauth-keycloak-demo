export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Demo</h1>
      <a
        href="/api/auth/login"
        className="inline-block px-4 py-2 rounded bg-black text-white"
      >
        Login with Keycloak
      </a>
    </main>
  );
}