/**
 * Generates a random string of the specified length containing uppercase and lowercase letters.
 *
 * @param length - The length of the random string to generate. Defaults to 5.
 * @returns A random string containing only letters (a-z, A-Z).
 *
 * @example
 * ```ts
 * generateRandomString(); // Returns a 5-character random string, e.g., "aBcDe"
 * generateRandomString(10); // Returns a 10-character random string, e.g., "XyZaBcDeFg"
 * ```
 */
export function generateRandomString(length = 5): string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const randomValues = globalThis.crypto.getRandomValues(new Uint8Array(length));

	return Array.from(randomValues, (byte) => letters[byte % letters.length]).join("");
}
