import { createFileRoute, redirect } from "@tanstack/react-router";
import { env } from "@/env";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: () => {
				const url = env.VITE_ROOT_REDIRECT_URL;
				return redirect({
					headers: {
						"Cache-Control":
							"public, s-max-age=31536000, max-age=3600, stale-while-revalidate=86400",
					},
					href: url,
					statusCode: 301,
				});
			},
		},
	},
});
