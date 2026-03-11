import { createFileRoute, redirect } from "@tanstack/react-router";
import { env } from "@/env";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: () => {
				return redirect({ href: env.VITE_ROOT_REDIRECT_URL, statusCode: 307 });
			},
		},
	},
});
