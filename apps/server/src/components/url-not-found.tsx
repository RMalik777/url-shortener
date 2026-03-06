import { NotFoundTemplate } from "@repo/ui/template/notfound";
import { Button } from "@repo/ui/components/button";
import { env } from "@/env";

export function UrlNotFound() {
	return (
		<NotFoundTemplate
			title="URL not found"
			message="The URL you're looking for is not available. Make sure you have entered the correct URL or contact the owner."
		>
			<Button
				variant="outline"
				nativeButton={false}
				render={<a href={env.VITE_LONG_URL}>Go to Home</a>}
			/>
		</NotFoundTemplate>
	);
}
