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

export const parseSpleisCsv = (text: string) => {
  const [header, ...lines] = parseCsv(text.replace(/^\uFEFF/, ""));
  const [giver, hilsen, belop, dato] = ["giver", "hilsen", "beløp", "dato"].map(
    (column) => header?.indexOf(column) ?? -1
  );
  if (giver < 0 || hilsen < 0 || belop < 0) return null;

  return lines
    .filter((row) => row.length === header.length)
    .map((row) => {
      const donation = {
        name: row[giver].trim().slice(0, 100),
        message: row[hilsen].trim().slice(0, 500),
        amount: Number(row[belop].replace(",", ".")),
        donatedAt: null as Date | null,
      };
      const [, day, month, year, hour, minute] =
        row[dato]?.match(
          /(\d{1,2})\.\s*([a-zæøå]{3})\D*?(\d{4})\D+(\d{1,2}):(\d{2})/i
        ) ?? [];
      const monthIndex = "jan feb mar apr mai jun jul aug sep okt nov des"
        .split(" ")
        .indexOf(month?.toLowerCase() ?? "");
      if (monthIndex < 0) return donation;

      const local = Date.UTC(+year, monthIndex, +day, +hour, +minute);
      const offset = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Oslo",
        timeZoneName: "shortOffset",
      })
        .formatToParts(local)
        .find((part) => part.type === "timeZoneName")
        ?.value.slice(3);
      return {
        ...donation,
        donatedAt: new Date(local - Number(offset || 0) * 3_600_000),
      };
    })
    .filter(
      (donation) => Number.isFinite(donation.amount) && donation.amount > 0
    );
};
