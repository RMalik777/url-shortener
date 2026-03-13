import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@repo/ui/components/button";
import { LinkRemovedTemplate } from "@repo/ui/template/link-removed";

export const Route = createFileRoute("/(app)/(splash)/link-removed/")({
	headers: () => ({
		"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
	}),
	head: () => ({
		title: "Link Removed | URL Shortener",
		meta: [
			{
				name: "description",
				content: "The link you are trying to access has been removed.",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<LinkRemovedTemplate>
			<Button variant="default" render={<Link to="/">Go to Homepage</Link>} nativeButton={false} />
		</LinkRemovedTemplate>
	);
}
