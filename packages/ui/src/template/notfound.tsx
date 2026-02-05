/**
 * A template component for displaying error pages.
 *
 * @param props - The component props
 * @param props.children - React elements to render, typically navigation buttons or links
 * @param props.errorCode - The HTTP error code to display (default: 404)
 * @param props.title - The error page title (default: "Page not found")
 * @param props.message - A descriptive message explaining the error (default: "Sorry, we couldn't find the page you're looking for. Try going back home or double-check the URL. ")
 * @returns A centered error page with error code, title, message, and action elements
 */
export function NotFoundTemplate({
	children,
	errorCode = 404,
	title = "Page not found",
	message = "Sorry, we couldn't find the page you're looking for. Try going back home or double-check the URL. ",
}: {
	children: React.ReactNode;
	errorCode?: number;
	title?: string;
	message?: string;
}) {
	return (
		<main className="flex h-svh w-full items-center justify-center bg-linear-to-b from-red-50 to-white to-50% px-6 py-16">
			<div className="flex flex-col items-center justify-center gap-2 text-center">
				<div className="inline-flex items-center justify-center bg-red-100 p-2 dark:bg-red-950">
					<span className="font-mono text-3xl font-semibold tracking-tight text-destructive">
						{errorCode}
					</span>
				</div>

				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>

				<p className="mb-4 max-w-prose text-sm text-muted-foreground">{message}</p>

				<div className="flex items-center justify-center">{children}</div>
			</div>
		</main>
	);
}
