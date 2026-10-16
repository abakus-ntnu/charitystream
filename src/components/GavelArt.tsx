import styles from "./GavelArt.module.css";

// A gavel striking its block, in the style of azart-lounge's game art
const GavelArt = () => (
  <svg className={styles.art} viewBox="0 0 120 120" aria-hidden="true">
    <g shapeRendering="crispEdges">
      <rect x="20" y="92" width="56" height="8" fill="#8f7119" />
      <rect x="24" y="88" width="48" height="4" fill="#c9a227" />
    </g>
    <g className={styles.sparks} fill="#c9a227">
      <rect x="44" y="70" width="4" height="10" />
      <rect x="26" y="74" width="4" height="9" transform="rotate(-50 28 78)" />
      <rect x="62" y="74" width="4" height="9" transform="rotate(50 64 78)" />
    </g>
    <g className={styles.gavel} shapeRendering="crispEdges">
      <rect x="58" y="52" width="46" height="6" fill="#b21c17" />
      <rect x="34" y="40" width="24" height="32" fill="#c9a227" />
      <rect x="34" y="40" width="24" height="4" fill="#8f7119" />
      <rect x="34" y="68" width="24" height="4" fill="#8f7119" />
    </g>
  </svg>
);

export default GavelArt;
