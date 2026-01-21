import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/signup")({
	loader: () => {
		throw redirect({ to: "/signin", statusCode: 302 });
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Temporarily Unavailable</h1>
		</main>
	);
}
