import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { configure } from "onedollarstats";
import { StrictMode, useEffect } from "react";

import { NotFound } from "@/components/not-found";
import TanStackQueryDevtools from "@/lib/integrations/tanstack-query/devtools";
import appCss from "@repo/ui/globals.css?url";
import { ErrorComponent } from "@repo/ui/template/error";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "URL Shortener",
			},
			{
				name: "description",
				content: "A simple URL shortener",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
	errorComponent: ErrorComponent,
});

function RootDocument({ children }: Readonly<{ children: React.ReactNode }>) {
	useEffect(() => {
		configure({
			hostname: "raf.li",
			devmode: true,
		});
	}, []);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<StrictMode>
					{children}
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
					<Scripts />
				</StrictMode>
			</body>
		</html>
	);
}
