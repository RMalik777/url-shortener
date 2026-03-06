import { createFileRoute, redirect } from "@tanstack/react-router";
import { env } from "@/env";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: () => {
				return redirect({ href: env.VITE_LONG_URL, statusCode: 307 });
			},
		},
	},
});
