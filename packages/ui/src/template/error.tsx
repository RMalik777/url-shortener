import { AlertOctagonIcon } from "lucide-react";

import { CopyButton } from "../components/custom/copy-button";

import type { ErrorComponentProps } from "@tanstack/react-router";

export function ErrorComponent({ error, reset, info }: ErrorComponentProps) {
	return (
		<main className="flex min-h-svh w-full items-center justify-center bg-linear-to-b from-red-50 to-white to-50% px-6 py-16">
			<div className="flex flex-col items-center justify-center gap-2 text-center">
				<div className="inline-flex items-center justify-center bg-red-100 p-2 dark:bg-red-950">
					<AlertOctagonIcon className="size-8 text-destructive" />
				</div>

				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Error Occurred
				</h1>

				<p className="mb-4 max-w-prose text-base text-muted-foreground">
					An unexpected error has occurred. Please refresh the page and try again.
				</p>

				<div className="max-w-prose space-y-2">
					<section className="text-base">
						<h2 className="font-semibold">Error Message</h2>
						<pre className="bg-muted p-4 text-left font-medium tracking-tight break-all whitespace-pre-wrap">
							{error.message}
						</pre>
					</section>
					<section>
						<h2>Stack Trace</h2>
						<pre className="relative bg-muted p-4 text-left text-sm break-all whitespace-pre-wrap">
							<CopyButton
								size="icon-sm"
								variant="secondary"
								label="Copy Error Stack"
								value={error.stack ?? ""}
								className="absolute top-0 right-0"
							/>
							<code>{error.stack}</code>
						</pre>
					</section>
					{info && (
						<section>
							<h2>Component Stack</h2>
							<pre className="relative bg-muted p-4 text-left text-sm break-all whitespace-pre-wrap">
								<CopyButton
									size="icon-sm"
									variant="secondary"
									label="Copy Component Stack"
									value={info.componentStack}
									className="absolute top-0 right-0"
								/>
								<code>{info.componentStack}</code>
							</pre>
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
