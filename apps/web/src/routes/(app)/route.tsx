import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { getAllUrlsOptions } from "@/lib/query/url";
import { getSessionFn } from "@/lib/services/session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const Route = createFileRoute("/(app)")({
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (!session?.user) {
			throw redirect({ to: "/signin" });
		}

		return { user: session.user };
	},
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getAllUrlsOptions({ userId: context.user.id })),
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();

	return (
		// pb-24 clears the floating bottom nav on mobile; at sm+ the bar moves to the
		// top and the page shell reserves space for it instead.
		<div className="flex min-h-svh flex-col pb-24 sm:pb-0">
			<Header user={user} />
			<Outlet />
			<Footer />
		</div>
	);
}
