import { NextRequest } from "next/server";

function getPasswordFromHeaders(request: NextRequest) {
  return request.headers.get("password") || "";
}

function unauthorizedResponse() {
  return new Response("Ugyldig passord :'(", { status: 401 });
}

export async function POST(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  return new Response("Vellykket", { status: 200 });
}
