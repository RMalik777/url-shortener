import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/lib/services/session";

import { Header } from "@/components/header";

export const Route = createFileRoute("/(app)")({
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (!session?.user) {
			throw redirect({ to: "/signin" });
		}
		return { user: session.user };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<>
			<Header user={user} />
			<main className="pt-16">
				<Outlet />
			</main>
		</>
	);
}
