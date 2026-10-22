import { describe, test } from "vitest";
import { generateRandomString } from "./generator";

describe("generateRandomString", () => {
	test("generates string with default length", async ({ bench }) => {
		await bench("generates string with default length", () => {
			generateRandomString();
		}).run();
	});

	test("generates string with length 1", async ({ bench }) => {
		await bench("generates string with length 1", () => {
			generateRandomString(1);
		}).run();
	});

	test("generates string with length 10", async ({ bench }) => {
		await bench("generates string with length 10", () => {
			generateRandomString(10);
		}).run();
	});

	test("generates string with length 50", async ({ bench }) => {
		await bench("generates string with length 50", () => {
			generateRandomString(50);
		}).run();
	});

	test("generates string with length 100", async ({ bench }) => {
		await bench("generates string with length 100", () => {
			generateRandomString(100);
		}).run();
	});
});
