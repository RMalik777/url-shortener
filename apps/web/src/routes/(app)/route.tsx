import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { eq } from "drizzle-orm";

import { urls } from "@repo/db/schema";
import type { User } from "@repo/db/schema";
import { getSessionFn } from "@/lib/services/session";
import { db } from "@/db";

import { Header } from "@/components/header";

export const getUrlsFn = createServerFn({ method: "GET" })
	.inputValidator((data: User) => data)
	.handler(async ({ data }) => {
		return await db.select().from(urls).where(eq(urls.createdBy, data.id));
	});

export const Route = createFileRoute("/(app)")({
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (!session?.user) {
			throw redirect({ to: "/signin" });
		}
		const urlList = await getUrlsFn({ data: session.user });
		return { user: session.user, urlList: urlList };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<>
			<Header user={user} />
			<main className="px-4 sm:px-8">
				<Outlet />
			</main>
		</>
	);
}
