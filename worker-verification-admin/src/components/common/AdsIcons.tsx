import type { SVGProps } from 'react';

// Íconos de reparación de la app (ADSv, res/drawable): mismos trazados sobre 24×24.
// El contorno va en el color del texto (gris) y el detalle de reparación en naranja de marca.
type IconProps = SVGProps<SVGSVGElement>;

const BRAND = 'hsl(var(--primary))';

// Llave de la app (ic_empty_requests y otros), escalada dentro de cada ícono
const WRENCH = 'M14.7,6.3a4,4 0,0 0,-5.4 5.4L3,18l3,3 6.3,-6.3a4,4 0,0 0,5.4 -5.4l-2.6,2.6 -2.4,-0.6 -0.6,-2.4 2.6,-2.6z';

const Svg = ({ children, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" {...props}>
    {children}
  </svg>
);

/** Tuerca de carga (ic_ads_nut): hexágono y agujero, como la boca de la llave del logo. */
export const NutIcon = (props: IconProps) => (
  <Svg strokeWidth={2} {...props}>
    <path d="M21,12L16.5,19.79L7.5,19.79L3,12L7.5,4.21L16.5,4.21Z" />
    <circle cx="12" cy="12" r="3.5" />
  </Svg>
);

/** Sin técnicos (ic_empty_no_workers): pin de ubicación con una tuerca. */
export const EmptyNoWorkersIcon = (props: IconProps) => (
  <Svg strokeWidth={1.6} {...props}>
    <path d="M12,19.5c0,0 -5.8,-5.1 -5.8,-10a5.8,5.8 0 1,1 11.6,0c0,4.9 -5.8,10 -5.8,10z" />
    <path d="M15.10,9.40L13.55,12.08L10.45,12.08L8.90,9.40L10.45,6.72L13.55,6.72Z" stroke={BRAND} strokeWidth={1.3} />
    <circle cx="12" cy="9.4" r="1.2" stroke={BRAND} strokeWidth={1.2} />
    <path d="M5,21.5h3.5M10.25,21.5h3.5M16,21.5h3" />
  </Svg>
);

/** Sin solicitudes (ic_empty_requests): tabla de órdenes de trabajo con una llave. */
export const EmptyRequestsIcon = (props: IconProps) => (
  <Svg strokeWidth={1.6} {...props}>
    <path d="M8,4.5H6.5a1.5,1.5 0,0 0,-1.5 1.5v13a1.5,1.5 0,0 0,1.5 1.5h11a1.5,1.5 0,0 0,1.5 -1.5V6a1.5,1.5 0,0 0,-1.5 -1.5H16" />
    <path d="M9,3h6v3H9z" />
    <path d={WRENCH} stroke={BRAND} strokeWidth={2.2} transform="translate(6.6 8.6) scale(0.5)" />
  </Svg>
);

/** Sin PQR (ic_empty_pqr): globo de diálogo con una llave. */
export const EmptyPqrIcon = (props: IconProps) => (
  <Svg strokeWidth={1.6} {...props}>
    <path d="M5,4.5h14a1.5,1.5 0,0 1,1.5 1.5v9a1.5,1.5 0,0 1,-1.5 1.5H10l-4.5,3.5V16.5H5a1.5,1.5 0,0 1,-1.5 -1.5V6A1.5,1.5 0,0 1,5 4.5z" />
    <path d={WRENCH} stroke={BRAND} strokeWidth={2.2} transform="translate(7 4.6) scale(0.44)" />
  </Svg>
);

/** Casa con una llave, como el logo (ic_empty_inbox). */
export const EmptyHomeIcon = (props: IconProps) => (
  <Svg strokeWidth={1.6} {...props}>
    <path d="M3.5,11L12,4l8.5,7" />
    <path d="M5.5,9.5V19a1,1 0,0 0,1 1h11a1,1 0,0 0,1 -1V9.5" />
    <path d="M16.5,5.5V8" />
    <path d={WRENCH} stroke={BRAND} strokeWidth={2.2} transform="translate(7.1 9) scale(0.46)" />
  </Svg>
);

/** Caja de herramientas cerrada (ic_empty_jobs). */
export const EmptyToolboxIcon = (props: IconProps) => (
  <Svg strokeWidth={1.6} {...props}>
    <path d="M3,10.5h18v8a1.5,1.5 0,0 1,-1.5 1.5h-15a1.5,1.5 0,0 1,-1.5 -1.5z" />
    <path d="M3,10.5l2,-3h14l2,3" />
    <path d="M9,7.5V5.5a1,1 0,0 1,1 -1h4a1,1 0,0 1,1 1v2" />
    <path d="M10.5,13.5h3" stroke={BRAND} strokeWidth={2} />
    <path d="M3,14h6.5M14.5,14H21" />
  </Svg>
);

/** PQR del menú (ic_nav_pqr): globo de diálogo con una llave, todo del color del texto. */
export const PqrIcon = ({ strokeWidth = 2, ...props }: IconProps) => (
  <Svg strokeWidth={strokeWidth} {...props}>
    <path d="M21,12a8,8 0,0 1,-11.6 7.1L4,20l1,-4.6A8,8 0,1 1,21 12z" />
    <path d={WRENCH} strokeWidth={3.4} transform="translate(6.7 4.9) scale(0.52)" />
  </Svg>
);
