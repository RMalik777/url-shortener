import { createFileRoute, redirect } from "@tanstack/react-router";
import { env } from "@/env";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: () => {
				const url = env.VITE_ROOT_REDIRECT_URL;
				return redirect({ href: url, statusCode: 301 });
			},
		},
	},
});
