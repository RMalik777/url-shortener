import { Button } from "@repo/ui/components/button";
import { NotFoundTemplate } from "@repo/ui/template/notfound";
import { env } from "@/env";

export function NotFound() {
	return (
		<NotFoundTemplate>
			<Button
				variant="outline"
				render={<a href={env.VITE_LONG_URL}>Take me home</a>}
				nativeButton={false}
			/>
		</NotFoundTemplate>
	);
}
