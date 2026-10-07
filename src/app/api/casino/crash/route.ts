// Relays the casino's live crash stream; azart-vault's CORS only allows its own frontend
export const dynamic = "force-dynamic";

const CASINO_API_URL = process.env.CASINO_API_URL ?? "https://casino.abakus.no";

export async function GET(request: Request) {
  try {
    const upstream = await fetch(`${CASINO_API_URL}/api/games/crash/state`, {
      headers: { Accept: "text/event-stream" },
      cache: "no-store",
      signal: request.signal,
    });
    if (!upstream.ok || !upstream.body) {
      return new Response(null, { status: 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
