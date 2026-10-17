const CSV_URL =
  "https://www.spleis.no/api/private/project/518623/rewards-info.csv";
const { SITE_URL, POST_PASSWORD, SPLEIS_USER_TOKEN } = process.env;

if (!SITE_URL || !POST_PASSWORD || !SPLEIS_USER_TOKEN) {
  console.error("Need SITE_URL, POST_PASSWORD and SPLEIS_USER_TOKEN in .env");
  process.exit(1);
}

const relay = async () => {
  const spleis = await fetch(CSV_URL, {
    headers: { cookie: `spleis-user-token=${SPLEIS_USER_TOKEN}` },
  });
  const csv = await spleis.text();
  if (!spleis.ok) {
    throw new Error(`Spleis HTTP ${spleis.status}: ${csv.slice(0, 200)}`);
  }

  const site = await fetch(new URL("/api/admin/spleis/csv", SITE_URL), {
    method: "POST",
    headers: { password: POST_PASSWORD, "content-type": "application/json" },
    body: JSON.stringify({ csv, source: "script" }),
  });
  const reply = await site.text();
  if (!site.ok) throw new Error(`Site HTTP ${site.status}: ${reply}`);
  return reply;
};

for (;;) {
  const time = new Date().toLocaleTimeString("no-NO");
  try {
    console.log(time, "OK", await relay());
  } catch (error) {
    console.error(time, "FEIL", error.message);
  }
  await new Promise((resolve) =>
    setTimeout(resolve, 45_000 + Math.random() * 30_000)
  );
}
