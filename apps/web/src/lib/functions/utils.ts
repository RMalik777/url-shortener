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
