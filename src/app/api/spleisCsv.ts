import { createHash } from "node:crypto";

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ";") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

export type SpleisDonation = {
  key: string;
  name: string;
  message: string;
  amount: number;
};

// Returns null when the response isn't the Spleis CSV, e.g. a login page after the cookie expired
export const parseSpleisCsv = (text: string): SpleisDonation[] | null => {
  const [header, ...lines] = parseCsv(text.replace(/^\uFEFF/, ""));
  const [giver, hilsen, belop] = ["giver", "hilsen", "beløp"].map(
    (column) => header?.indexOf(column) ?? -1
  );
  if (giver < 0 || hilsen < 0 || belop < 0) return null;

  const seen = new Map<string, number>();
  return lines
    .filter((row) => row.length === header.length)
    .map((row) => {
      const raw = row.join(";");
      const count = (seen.get(raw) ?? 0) + 1;
      seen.set(raw, count);
      const hash = createHash("sha256").update(raw).digest("hex");
      return {
        key: `csv:${hash}:${count}`,
        name: row[giver].trim().slice(0, 100),
        message: row[hilsen].trim().slice(0, 500),
        amount: Number(row[belop].replace(",", ".")),
      };
    })
    .filter(
      (donation) => Number.isFinite(donation.amount) && donation.amount > 0
    );
};
