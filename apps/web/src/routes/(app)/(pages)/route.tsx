import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/(pages)")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		// Sole owner of page width and horizontal padding — child pages must not
		// re-declare either. sm:pt-20 clears the fixed top bar.
		<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:pt-20 sm:pb-10 lg:px-8">
			<Outlet />
		</main>
	);
}
