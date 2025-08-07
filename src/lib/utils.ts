import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sumArray<T>(array: T[], func: (item: T) => number) {
  return array.reduce((acc, item) => acc + func(item), 0);
}
