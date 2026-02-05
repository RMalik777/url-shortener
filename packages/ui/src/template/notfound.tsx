/**
 * A template component for displaying a 404 Not Found page.
 *
 * @param children - React nodes to be rendered as action buttons or links (e.g., "Go back home" button)
 * @returns A centered 404 error page with a red badge, heading, description, and custom children content
 */
export function NotFoundTemplate({ children }: { children: React.ReactNode }) {
	return (
		<main className="flex h-svh w-full items-center justify-center bg-linear-to-b from-red-50 to-white to-50% px-6 py-16">
			<div className="flex flex-col items-center justify-center gap-2 text-center">
				<div className="inline-flex items-center justify-center bg-red-100 p-2 dark:bg-red-950">
					<span className="font-mono text-3xl font-semibold tracking-tight text-destructive">
						404
					</span>
				</div>

				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Page not found
				</h1>

				<p className="mb-4 max-w-prose text-sm text-muted-foreground">
					Sorry, we couldn't find the page you're looking for. Try going back home or double-check
					the URL.
				</p>

				<div className="flex items-center justify-center">{children}</div>
			</div>
		</main>
	);
}
