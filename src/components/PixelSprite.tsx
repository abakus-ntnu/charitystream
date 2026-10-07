import React from "react";

export type Palette = Record<string, string>;

type RectsProps = {
  rows: string[];
  palette: Palette;
  x?: number;
  y?: number;
  px?: number;
};

// Draws a sprite as rects inside an existing <svg>; "." and unknown chars are transparent
export const SpriteRects = ({
  rows,
  palette,
  x = 0,
  y = 0,
  px = 1,
}: RectsProps) => (
  <g shapeRendering="crispEdges">
    {rows.flatMap((row, r) =>
      row
        .split("")
        .map((ch, c) =>
          palette[ch] ? (
            <rect
              key={`${r}-${c}`}
              x={x + c * px}
              y={y + r * px}
              width={px + 0.1}
              height={px + 0.1}
              fill={palette[ch]}
            />
          ) : null
        )
    )}
  </g>
);

type Props = {
  rows: string[];
  palette: Palette;
  // screen pixels per sprite pixel; keep it whole so the edges stay sharp
  scale: number;
  label?: string;
  className?: string;
};

const PixelSprite = ({ rows, palette, scale, label, className }: Props) => {
  const width = rows[0].length;
  const height = rows.length;
  return (
    <svg
      className={className}
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      <SpriteRects rows={rows} palette={palette} />
    </svg>
  );
};

export default PixelSprite;
