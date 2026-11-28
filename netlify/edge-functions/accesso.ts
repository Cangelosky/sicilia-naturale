// Accesso con nome utente e password (solo sui siti dove sono impostate le variabili SN_UTENTE e SN_PASSWORD).
// Sugli altri siti (per esempio l'anteprima attuale) non fa nulla.
export default async (request: Request, context: any) => {
  const utente = Netlify.env.get("SN_UTENTE");
  const password = Netlify.env.get("SN_PASSWORD");
  if (!utente || !password) { const r = await context.next(); r.headers.set("x-sn-accesso", "libero u=" + (utente ? 1 : 0) + " p=" + (password ? 1 : 0)); return r; }
  const h = request.headers.get("authorization") || "";
  if (h.startsWith("Basic ")) {
    try {
      const [u, ...p] = atob(h.slice(6)).split(":");
      if (u === utente && p.join(":") === password) return context.next();
    } catch (_) { /* intestazione non valida */ }
  }
  return new Response("Accesso riservato a Sicilia Naturale.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Sicilia Naturale", charset="UTF-8"', "Content-Type": "text/plain; charset=utf-8" },
  });
};
export const config = { path: "/*" };
