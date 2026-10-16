// Pixel sprite of Abaku, ported from azart-lounge (crossingBoard/abaku.ts)

const SPRITE = [
  "..W..........W..",
  "..WH........HW..",
  "...WH......HW...",
  "..RRRRRRRRRRRR..",
  ".DRRRRRRRRRRRRD.",
  ".DRWWWRRRRWWWRD.",
  "..RWWWRRRRWWWR..",
  "..RWWWRRRRWWWR..",
  "..RRRRSSSSRRRR..",
  "..RRRSKSSKSRRR..",
  "..RRRSSSSSSRRR..",
  "..DRRRRRRRRRRD..",
  "...DRRRRRRRRD...",
  "..RRRRRRRRRRRR..",
  "...RRRR..RRRR...",
  "...DDD....DDD...",
];

const withPixels = (rows: string[], pixels: [number, number, string][]) => {
  const grid = rows.map((row) => row.split(""));
  for (const [r, c, ch] of pixels) grid[r][c] = ch;
  return grid.map((row) => row.join(""));
};

const CHEERING_SPRITE = withPixels(SPRITE, [
  [6, 4, "K"],
  [6, 11, "K"],
  ...[6, 7, 8, 9, 10].flatMap((r): [number, number, string][] => [
    [r, 0, "R"],
    [r, 15, "R"],
  ]),
  [11, 1, "R"],
  [11, 14, "R"],
  [13, 2, "."],
  [13, 13, "."],
]);

// Abaku gets drunker as the beer glass fills: sober, tipsy, drunk, wasted
const CHEEKS: [number, number, string][] = [
  [8, 3, "P"],
  [9, 3, "P"],
  [8, 12, "P"],
  [9, 12, "P"],
];

// eyelids drop over the top of the eyes, pupils sink
const DROOPY_EYES: [number, number, string][] = [
  ...[3, 4, 5, 10, 11, 12].map((c): [number, number, string] => [5, c, "R"]),
  [6, 4, "W"],
  [6, 11, "W"],
  [7, 4, "K"],
  [7, 11, "K"],
];

// nearly shut and cross-eyed, with the tongue out
const WASTED_EYES: [number, number, string][] = [
  ...[5, 6].flatMap((r) =>
    [3, 4, 5, 10, 11, 12].map((c): [number, number, string] => [r, c, "R"])
  ),
  [7, 3, "W"],
  [7, 4, "W"],
  [7, 5, "K"],
  [7, 10, "K"],
  [7, 11, "W"],
  [7, 12, "W"],
  [11, 7, "T"],
  [11, 8, "T"],
];

export const DRUNK_SPRITES = [
  CHEERING_SPRITE,
  withPixels(CHEERING_SPRITE, CHEEKS),
  withPixels(CHEERING_SPRITE, [...CHEEKS, ...DROOPY_EYES]),
  withPixels(CHEERING_SPRITE, [...CHEEKS, ...WASTED_EYES]),
];

export const drunkStage = (fill: number) =>
  fill >= 0.8 ? 3 : fill >= 0.5 ? 2 : fill >= 0.25 ? 1 : 0;

export const PALETTE: Record<string, string> = {
  R: "#d1201b",
  D: "#8e0f0c",
  S: "#e8524a",
  W: "#f2f2f2",
  H: "#bdbdbd",
  K: "#111111",
  P: "#ff8fa3",
  T: "#ff5d73",
};
