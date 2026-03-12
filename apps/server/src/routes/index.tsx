import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/env";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: () => {
				const url = env.VITE_ROOT_REDIRECT_URL;
				return new Response(`<html><body><a href="${url}">moved here</a></body></html>`, {
					status: 301,
					headers: {
						Location: url,
						"Content-Type": "text/html",
					},
				});
			},
		},
	},
});
