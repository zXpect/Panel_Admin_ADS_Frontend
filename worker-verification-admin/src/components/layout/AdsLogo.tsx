interface AdsLogoProps {
  size?: number;
  // Color de la llave: claro sobre fondos oscuros (menú), charcoal sobre fondos claros
  wrenchColor?: string;
}

/** Logo de ADS (opción A, docs/branding): techo naranja y llave con boca de tuerca. */
export const AdsLogo = ({ size = 40, wrenchColor = '#F6F3EE' }: AdsLogoProps) => (
  <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="flex-shrink-0">
    <path d="M12 57 L60 16 L108 57" fill="none" stroke="#F28A2E" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="85" y="22" width="11" height="23" rx="2.5" fill="#F28A2E" />
    <path
      fill={wrenchColor}
      d="M53.20 41.88 A17.5 17.5 0 0 0 52.80 73.95 L53.80 101 A6.2 6.2 0 0 0 66.20 101 L67.20 73.95 A17.5 17.5 0 0 0 66.80 41.88 L66.80 57 A6.8 6.8 0 0 1 53.20 57 Z"
    />
    <path fill="#F28A2E" d="M63.38 96.95 L60.00 98.90 L56.62 96.95 L56.62 93.05 L60.00 91.10 L63.38 93.05 Z" />
  </svg>
);
