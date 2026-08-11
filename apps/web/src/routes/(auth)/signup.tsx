import { createFileRoute, redirect } from "@tanstack/react-router";

// Self-serve sign-up is closed; accounts are created through the social providers
// on /signin. The loader always redirects, so this route renders nothing.
export const Route = createFileRoute("/(auth)/signup")({
	loader: () => {
		throw redirect({ to: "/signin", statusCode: 302 });
	},
});
