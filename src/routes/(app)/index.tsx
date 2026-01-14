import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/")({
	component: App,
	head: () => ({
		title: "TanStack React Start Demo App",
		meta: [
			{ title: "My App - Home" },
			{
				name: "description",
				content: "Welcome to My App, a platform for...",
			},
		],
	}),
});

function App() {
	return (
		<div className="">
			<h1>Title</h1>
		</div>
	);
}
