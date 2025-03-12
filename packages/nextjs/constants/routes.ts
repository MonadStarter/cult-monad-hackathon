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

export const contentPagesList: NavigationItem[] = [];
