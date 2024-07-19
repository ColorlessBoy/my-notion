import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stringToColor(s: string | null | undefined): string {
  if (s === null || s === undefined || s.length === 0) {
    return vibrantColors[0];
  }
  let index: number = 1;
  for (const ch of s) {
    index *= ch.charCodeAt(0);
  }
  if (index < 0) {
    index = 0;
  } else if (index >= vibrantColors.length) {
    index %= vibrantColors.length;
  }
  return vibrantColors[index];
}

export const vibrantColors = [
  "#f5f5f5",
  "#FF6F61", // Coral
  "#98FF98", // Mint Green
  "#E6E6FA", // Lavender
  "#F4C2C2", // Blush Pink
  "#000080", // Navy Blue
  "#FFDB58", // Mustard Yellow
  "#008080", // Teal
  "#800020", // Burgundy
  "#FFE5B4", // Peach
  "#B2AC88", // Sage Green
  "#DCAE96", // Dusty Rose
  "#708090", // Slate Gray
  "#F7E7CE", // Champagne
  "#E2725B", // Terracotta
  "#0047AB", // Cobalt Blue
  "#808000", // Olive Green
  "#CCCCFF", // Periwinkle
  "#FD5E53", // Sunset Orange
  "#36454F", // Charcoal
  "#93E9BE", // Seafoam Green
  "#E0B0FF", // Mauve
  "#FFFFF0", // Ivory
  "#A9B3C1", // Dusty Blue
  "#50C878", // Emerald Green
  "#96A8A1", // Pewter
  "#483C32", // Taupe
  "#C8A2C8", // Lilac
  "#228B22", // Forest Green
  "#E97451", // Burnt Sienna
  "#DAA520", // Goldenrod
  "#FFC1CC", // Bubblegum Pink
  "#191970", // Midnight Blue
];
