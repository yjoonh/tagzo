export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "tagzo_admin=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0",
    },
  });
}
