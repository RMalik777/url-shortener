const PROTOCOL = /^https?:\/\//i;

/**
 * Prefixes `https://` unless the value already carries an http(s) scheme.
 *
 * Uses a full scheme match rather than `startsWith("http")` so hostnames that
 * merely begin with "http" (e.g. `httpbin.org`) are still prefixed.
 */
export function withProtocol(value: string) {
	const trimmed = value.trim();
	return PROTOCOL.test(trimmed) ? trimmed : `https://${trimmed}`;
}
