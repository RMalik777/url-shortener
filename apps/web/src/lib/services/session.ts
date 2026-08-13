import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({
		headers,
	});

	return session;
});

/**
 * The signed-in user as better-auth reports it. Distinct from `@repo/db`'s `User`:
 * optional fields arrive as `undefined` rather than `null`.
 */
export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionFn>>>["user"];
