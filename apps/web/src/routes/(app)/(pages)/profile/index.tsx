import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/(pages)/profile/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(app)/profile/"!</div>;
}
