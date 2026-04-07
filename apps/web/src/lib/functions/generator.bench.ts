import { describe, bench } from "vitest";
import { generateRandomString } from "./generator";

describe("generateRandomString", () => {
	bench("generates string with default length", () => {
		generateRandomString();
	});

	bench("generates string with length 1", () => {
		generateRandomString(1);
	});

	bench("generates string with length 10", () => {
		generateRandomString(10);
	});

	bench("generates string with length 50", () => {
		generateRandomString(50);
	});

	bench("generates string with length 100", () => {
		generateRandomString(100);
	});
});
