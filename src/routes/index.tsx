import { createFileRoute } from "@tanstack/react-router";

import { NotFound } from "@/components/not-found";

export const Route = createFileRoute("/")({
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
	notFoundComponent: NotFound,
});

function App() {
	return (
		<div className="">
			<h1>Title</h1>
		</div>
	);
}
