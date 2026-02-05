import { AlertOctagonIcon } from "lucide-react";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function ErrorComponent({ error, reset, info }: ErrorComponentProps) {
	return (
		<main className="flex h-svh w-full items-center justify-center bg-linear-to-b from-red-50 to-white to-50% px-6 py-16">
			<div className="flex flex-col items-center justify-center gap-2 text-center">
				<div className="inline-flex items-center justify-center bg-red-100 p-2 dark:bg-red-950">
					<AlertOctagonIcon className="size-8 text-destructive" />
				</div>

				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Error Occurred
				</h1>

				<p className="mb-4 max-w-prose text-sm text-muted-foreground">
					An unexpected error has occurred. Please refresh the page and try again.
				</p>

				<div>
					<p>Error Message</p>
					<pre className="bg-muted p-2">{error.message}</pre>
				</div>
				<div>
					<p>Stack Trace</p>
					<pre className="bg-muted p-2 text-left">{error.stack}</pre>
				</div>
				{info && (
					<div>
						<p>Component Stack</p>
						<pre className="bg-muted p-2 text-left">{info.componentStack}</pre>
					</div>
				)}
			</div>
		</main>
	);
}
