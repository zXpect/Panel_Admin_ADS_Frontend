interface AdsLogoProps {
  size?: number;
  // 'theme': sigue el tema (claro u oscuro), como ic_ads_logo de la app.
  // 'onNavy': siempre la versión oscura, para fondos navy como el menú (ic_ads_logo_on_navy)
  variant?: 'theme' | 'onNavy';
}

/**
 * Logo de ADS, copiado de docs/branding/ads-logo-claro.svg y ads-logo-oscuro.svg
 * (opción A). No redibujar ni recolorear: los colores salen de --logo-roof y
 * --logo-wrench en globals.css.
 */
export const AdsLogo = ({ size = 40, variant = 'theme' }: AdsLogoProps) => {
  const roof = variant === 'onNavy' ? '#F28A2E' : 'var(--logo-roof)';
  const wrench = variant === 'onNavy' ? '#F6F3EE' : 'var(--logo-wrench)';

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="flex-shrink-0">
      <polyline points="12,58 60,18 108,58" fill="none" stroke={roof} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="82" y="20" width="12" height="24" rx="2" fill={roof} />
      <path
        d="M51.5 42 L51.5 55 L68.5 55 L68.5 42 L78 50 L78 58 L60 73.1 L42 58 L42 50 Z"
        strokeWidth="4" strokeLinejoin="round" fill={wrench} stroke={wrench}
      />
      <path
        fillRule="evenodd" fill={wrench}
        d="M52.5 66 H67.5 V104.5 A7.5 7.5 0 0 1 52.5 104.5 Z M60 95.4 L63.98 97.7 L63.98 102.3 L60 104.6 L56.02 102.3 L56.02 97.7 Z"
      />
    </svg>
  );
};
