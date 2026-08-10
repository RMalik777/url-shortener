import { AlertOctagonIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "../components/button";
import { CopyButton } from "../components/custom/copy-button";

import type { ErrorComponentProps } from "@tanstack/react-router";

export function ErrorComponent({ error, reset, info }: ErrorComponentProps) {
	return (
		<main className="flex min-h-svh w-full items-center justify-center bg-linear-to-b from-destructive/10 to-background to-50% px-6 py-16">
			<div className="flex flex-col items-center justify-center gap-2 text-center">
				<div className="inline-flex items-center justify-center bg-destructive/10 p-2">
					<AlertOctagonIcon className="size-8 text-destructive" />
				</div>

				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Error Occurred
				</h1>

				<p className="max-w-prose text-sm text-muted-foreground">
					Something went wrong while rendering this page. Try again, or copy the details below if
					you need to report it.
				</p>

				<Button variant="outline" className="mb-4" onClick={reset}>
					<RotateCcwIcon />
					Try again
				</Button>

				<div className="max-w-prose space-y-2">
					<section>
						<h2 className="text-left text-sm font-semibold">Error Message</h2>
						<pre className="bg-muted p-4 text-left text-sm font-medium tracking-tight break-all whitespace-pre-wrap">
							{error.message}
						</pre>
					</section>
					<section>
						<h2 className="text-left text-sm font-semibold">Stack Trace</h2>
						<pre className="relative bg-muted p-4 text-left text-sm break-all whitespace-pre-wrap">
							<CopyButton
								size="icon-sm"
								variant="secondary"
								label="Error stack"
								value={error.stack ?? ""}
								className="absolute top-0 right-0"
							/>
							<code>{error.stack}</code>
						</pre>
					</section>
					{info && (
						<section>
							<h2 className="text-left text-sm font-semibold">Component Stack</h2>
							<pre className="relative bg-muted p-4 text-left text-sm break-all whitespace-pre-wrap">
								<CopyButton
									size="icon-sm"
									variant="secondary"
									label="Component stack"
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
