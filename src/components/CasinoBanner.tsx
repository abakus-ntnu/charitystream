import PixelSprite from "@/components/PixelSprite";

import styles from "./CasinoBanner.module.css";

const CASINO_URL = "https://casino.abakus.no";

const TROPHY = [
  "...YYYYYYYYYY...",
  ".YYYWYYYYYYYDYY.",
  ".Y.YWYYYYYYYD.Y.",
  ".Y.YWYYYYYYYD.Y.",
  "..YYYYYYYYYYDY..",
  "....YYYYYYYD....",
  ".....YYYYYD.....",
  "......YYYD......",
  ".......YD.......",
  ".......YD.......",
  ".....YYYYYD.....",
  "....YYYYYYYD....",
  "....DDDDDDDD....",
];

const TROPHY_PALETTE = {
  Y: "#c9a227",
  D: "#8f7119",
  W: "#f2f2f2",
};

const CasinoBanner = () => (
  <a
    className={`${styles.banner} group flex flex-col gap-5 h-full p-5 md:p-6 bg-panel no-underline hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2`}
    href={CASINO_URL}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span className="logo flex items-center gap-2 text-lg md:text-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.mark} src="/webkom.svg" alt="" />
      <span>
        Webkom<span className="logo__accent">Casino</span>
      </span>
    </span>

    <div className="flex items-center gap-4">
      <span className={`${styles.trophy} flex-none p-3 bg-ink-alt`}>
        <PixelSprite rows={TROPHY} palette={TROPHY_PALETTE} scale={4} />
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="eyebrow text-gold">Spill og vinn</span>
        <h2 className="m-0 text-xl md:text-2xl font-extrabold leading-tight">
          Vinn trofé på <span className="text-gold">abakus.no</span>
        </h2>
        <p className="m-0 text-sm text-text-dim">…og andre flotte premier!</p>
      </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 bg-ink-alt">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`${styles.qr} w-full max-w-56 h-auto`}
        src="/casino-qr.svg"
        alt="QR-kode til casino.abakus.no"
      />
      <span className="eyebrow">Skann koden for å spille</span>
    </div>

    <span className="button button--primary group-hover:bg-red-5 text-center">
      Spill på casino.abakus.no →
    </span>
  </a>
);

export default CasinoBanner;
