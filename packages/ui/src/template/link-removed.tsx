import { AlertOctagonIcon } from "lucide-react";
/**
 * A template component for displaying a "Link Removed" or "Link Not Available" page.
 *
 * @param children - React nodes to be rendered as action buttons or links (e.g., "Go to homepage" button)
 * @returns A centered error page with a warning badge, heading, description, and custom children content
 */
export function LinkRemovedTemplate({ children }: { children: React.ReactNode }) {
	return (
		<main className="flex h-svh w-full items-center justify-center bg-linear-to-b from-warning/10 to-background to-50% px-6 py-16">
			<div className="flex flex-col items-center justify-center gap-2 text-center">
				<div className="inline-flex items-center justify-center bg-warning/10 p-2">
					<AlertOctagonIcon className="size-8 text-warning" />
				</div>

				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Link Not Available
				</h1>

				<p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
					This link is unavailable. It may have expired or been removed by its owner. Please check
					the URL or reach out to the person who shared it.
				</p>

				<div className="flex items-center justify-center gap-2">{children}</div>
			</div>
		</main>
	);
}
