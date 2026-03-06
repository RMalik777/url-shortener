import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/(pages)")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="min-h-svh px-2 pt-2 sm:px-4 sm:pt-16 md:px-8 lg:px-16 lg:pb-4">
			<Outlet />
		</main>
	);
}
