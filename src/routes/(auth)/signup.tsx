import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Temporarily Unavailable</h1>
		</main>
	);
}
