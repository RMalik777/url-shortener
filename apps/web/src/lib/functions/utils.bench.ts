import { describe, test } from "vitest";
import { acronym } from "./utils";

describe("acronym", () => {
	test("returns default for undefined input", async ({ bench }) => {
		await bench("returns default for undefined input", () => {
			acronym();
		}).run();
	});

	test("returns default for empty string", async ({ bench }) => {
		await bench("returns default for empty string", () => {
			acronym("");
		}).run();
	});

	test("returns uppercase for short name", async ({ bench }) => {
		await bench("returns uppercase for short name", () => {
			acronym("AB");
		}).run();
	});

	test("generates acronym from two words", async ({ bench }) => {
		await bench("generates acronym from two words", () => {
			acronym("John Doe");
		}).run();
	});

	test("generates acronym from multiple words", async ({ bench }) => {
		await bench("generates acronym from multiple words", () => {
			acronym("International Business Machines Corporation");
		}).run();
	});

	test("generates acronym with custom length", async ({ bench }) => {
		await bench("generates acronym with custom length", () => {
			acronym("International Business Machines Corporation", 4);
		}).run();
	});
});
