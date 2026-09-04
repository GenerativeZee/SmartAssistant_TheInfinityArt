import type { SVGProps } from "react";

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconAaj(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3v2M4.9 4.9l1.4 1.4M3 12h2M19 12h2M17.7 6.3l1.4-1.4M12 8a4 4 0 0 0-4 4c0 1.6.9 2.7 2 3.5V17a2 2 0 0 0 4 0v-1.5c1.1-.8 2-1.9 2-3.5a4 4 0 0 0-4-4Z" />
      <path d="M10 20h4" />
    </svg>
  );
}

export function IconClients(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.7-3 3-4.6 5.5-4.6S13.8 16 14.5 19" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19c-.3-1.6-1-3-2-4" />
    </svg>
  );
}

export function IconJobs(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3.5" y="6" width="17" height="13" rx="2" />
      <path d="M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6M3.5 11h17" />
    </svg>
  );
}

export function IconPaisa(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M7 6h10M7 9.5h10M7 6c3.6 0 5 2 5 3.5S10.6 13 7 13l6.5 5.5M7 13h3" />
    </svg>
  );
}

export function IconPlus(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconGear(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </svg>
  );
}

export function IconPhone(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M6.5 3.5c.7 0 1.3.5 1.5 1.2l.8 2.7c.2.6 0 1.2-.5 1.6l-1.3 1a12 12 0 0 0 5.4 5.4l1-1.3c.4-.5 1-.7 1.6-.5l2.7.8c.7.2 1.2.8 1.2 1.5V20a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4 5.5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function IconChat(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5Z" />
    </svg>
  );
}

export function IconCheck(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </svg>
  );
}
