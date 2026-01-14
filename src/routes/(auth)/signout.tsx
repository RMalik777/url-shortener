import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/signout")({
	loader: () => {
		throw redirect({ to: "/signin", statusCode: 302 });
	},
});
