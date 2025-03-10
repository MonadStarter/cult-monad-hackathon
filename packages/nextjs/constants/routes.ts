import { NavigationItem } from "~~/types/types";

export const enum APP_ROUTES {
  HOME = "/",
  RANKINGS = "/rankings",
  LAUNCH = "/launch",
  SUPPORT = "/support",
}

export const routerItemsList: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
  },
  {
    id: "launch",
    label: "Launch",
    href: "/create",
  },
  {
    id: "rankings",
    label: "Rankings",
    href: "/rankings",
  },
];

export const contentPagesList: NavigationItem[] = [
  {
    id: "about",
    label: "About Us",
    href: "/about",
  },
  {
    id: "contact",
    label: "Contact Us",
    href: "/contact",
  },
  {
    id: "terms",
    label: "Terms of Usage",
    href: "/terms",
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
];
