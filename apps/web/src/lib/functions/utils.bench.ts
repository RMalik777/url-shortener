import { describe, bench } from "vitest";
import { acronym } from "./utils";

describe("acronym", () => {
	bench("returns default for undefined input", () => {
		acronym();
	});

	bench("returns default for empty string", () => {
		acronym("");
	});

	bench("returns uppercase for short name", () => {
		acronym("AB");
	});

	bench("generates acronym from two words", () => {
		acronym("John Doe");
	});

	bench("generates acronym from multiple words", () => {
		acronym("International Business Machines Corporation");
	});

	bench("generates acronym with custom length", () => {
		acronym("International Business Machines Corporation", 4);
	});
});
