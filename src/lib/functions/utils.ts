import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: Array<ClassValue>) {
	return twMerge(clsx(inputs));
}

export function acronym(name?: string, length = 2) {
	if (!name) return "ID";
	if (name.trim() === "") return "ID";
	if (name.length <= length) return name.toUpperCase();
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, length);
}
