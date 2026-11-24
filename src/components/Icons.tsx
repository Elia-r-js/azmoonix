import type { SVGProps } from "react";

export type IconName =
  | "menu"
  | "close"
  | "logout"
  | "plus"
  | "search"
  | "trash"
  | "edit"
  | "eye"
  | "check"
  | "clock"
  | "user"
  | "chart"
  | "list"
  | "dashboard"
  | "settings"
  | "arrowLeft"
  | "arrowRight"
  | "play"
  | "download"
  | "spark"
  | "shield"
  | "calendar"
  | "book"
  | "clipboard"
  | "trophy"
  | "link"
  | "copy"
  | "alert";

const paths: Record<IconName, string[]> = {
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  logout: [
    "M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4",
    "M10 17l5-5-5-5",
    "M15 12H3",
  ],
  plus: ["M12 5v14", "M5 12h14"],
  search: ["M21 21l-4.35-4.35", "M19 11a8 8 0 11-16 0 8 8 0 0116 0z"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"],
  edit: ["M12 20h9", "M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"],
  eye: [
    "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z",
    "M12 15a3 3 0 100-6 3 3 0 000 6z",
  ],
  check: ["M20 6L9 17l-5-5"],
  clock: ["M12 7v5l3 2", "M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
  user: ["M20 21a8 8 0 10-16 0", "M12 13a4 4 0 100-8 4 4 0 000 8z"],
  chart: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"],
  list: [
    "M8 6h13",
    "M8 12h13",
    "M8 18h13",
    "M3 6h.01",
    "M3 12h.01",
    "M3 18h.01",
  ],
  dashboard: ["M3 12l9-9 9 9", "M5 10v10h14V10"],
  settings: [
    "M12 15a3 3 0 100-6 3 3 0 000 6z",
    "M4 12h2",
    "M18 12h2",
    "M12 4v2",
    "M12 18v2",
    "M6.3 6.3l1.4 1.4",
    "M16.3 16.3l1.4 1.4",
    "M17.7 6.3l-1.4 1.4",
    "M7.7 16.3l-1.4 1.4",
  ],
  arrowLeft: ["M19 12H5", "M12 19l-7-7 7-7"],
  arrowRight: ["M5 12h14", "M12 5l7 7-7 7"],
  play: ["M8 5v14l11-7-11-7z"],
  download: ["M12 3v12", "M7 10l5 5 5-5", "M5 21h14"],
  spark: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"],
  shield: [
    "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
    "M9 12l2 2 4-4",
  ],
  calendar: [
    "M8 2v4",
    "M16 2v4",
    "M3 9h18",
    "M5 4h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  ],
  book: ["M4 19.5A2.5 2.5 0 016.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"],
  clipboard: [
    "M9 4h6a1 1 0 011 1v1H8V5a1 1 0 011-1z",
    "M8 6H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2",
    "M9 13h6",
    "M9 17h4",
  ],
  trophy: [
    "M8 21h8",
    "M12 17v4",
    "M7 4h10v4a5 5 0 01-10 0V4z",
    "M7 6H4a3 3 0 003 3",
    "M17 6h3a3 3 0 01-3 3",
  ],
  link: [
    "M10 13a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1 1",
    "M14 11a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1-1",
  ],
  copy: [
    "M9 9h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V11a2 2 0 012-2z",
    "M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
  ],
  alert: [
    "M12 9v4",
    "M12 17h.01",
    "M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  ],
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
}

export function Icon({ name, className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {paths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
