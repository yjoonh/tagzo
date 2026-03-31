import { isAdmin } from "@/lib/rateLimit";

export async function GET(request: Request) {
  return Response.json({ admin: isAdmin(request) });
}
