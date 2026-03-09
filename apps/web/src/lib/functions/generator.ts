import { createRandomStringGenerator } from "@better-auth/utils/random";

const _generateRandomString = createRandomStringGenerator("A-Z", "a-z");

/**
 * Generates a random string composed of uppercase (A-Z) and lowercase (a-z) letters.
 * @param length - The length of the random string to generate. Defaults to `5`.
 * @returns A random alphanumeric string of the specified length.
 */
export function generateRandomString(length: number = 5) {
	return _generateRandomString(length);
}
