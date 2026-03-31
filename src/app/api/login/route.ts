export async function POST(request: Request) {
  const { email, password } = await request.json() as { email: string; password: string };

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const secret = process.env.ADMIN_SECRET ?? "";
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `tagzo_admin=${secret}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000`,
    },
  });
}
