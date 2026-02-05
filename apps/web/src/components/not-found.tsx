import { Link } from "@tanstack/react-router";

import { Button } from "@repo/ui/components/button";
import { NotFoundTemplate } from "@repo/ui/template/notfound";

export function NotFound() {
	return (
		<NotFoundTemplate>
			<Button variant="outline" render={<Link to="/">Take me home</Link>} nativeButton={false} />
		</NotFoundTemplate>
	);
}
