import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/link-removed/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(app)/link-removed/"!</div>;
}
