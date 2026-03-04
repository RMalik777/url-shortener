import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@repo/ui/components/button";
import { LinkRemovedTemplate } from "@repo/ui/template/link-removed";

export const Route = createFileRoute("/(app)/(splash)/link-removed/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<LinkRemovedTemplate>
			<Button variant="default" render={<Link to="/">Go to Homepage</Link>} nativeButton={false} />
		</LinkRemovedTemplate>
	);
}
