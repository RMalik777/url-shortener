import { createFileRoute, notFound, Link, redirect, rootRouteId } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Image } from "@unpic/react";

import { ArrowRightFromLine, ExternalLink, Shield } from "lucide-react";

import { env } from "@/env";
import { db } from "@/db";

import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";

import { eq } from "drizzle-orm";
import { urls } from "@repo/db/schema";
import { z } from "zod";

const schema = z.object({
	code: z.string().min(1),
});
const fetchData = createServerFn({ method: "GET" })
	.inputValidator((data: string) => {
		return schema.parse({ code: data });
	})
	.handler(async ({ data }) => {
		const result = await db.select().from(urls).where(eq(urls.urlShort, data.code)).get();
		return result;
	});
export const Route = createFileRoute("/$code/")({
	component: RouteComponent,
	headers: () => ({
		"Cache-Control": "private, max-age=1, stale-while-revalidate=5",
	}),
	beforeLoad: async ({ params }) => {
		const result = await fetchData({ data: params.code });
		if (result) {
			if (!result.intermediaryScreen) {
				return { result };
			}
			// throw redirect({
			// 	href: result.urlFull,
			// 	statusCode: 307,
			// });
		}
		throw notFound();
		// return redirect({
		//   href: `${env.VITE_LONG_URL}/link-removed`,
		//   statusCode: 307,
		// })
	},
	loader: async ({ context }) => {
		return context;
	},
});

function RouteComponent() {
	const data = Route.useLoaderData();
	const thumbnailUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${data.result.urlFull}`;

	return (
		<main className="flex min-h-svh items-center justify-center bg-linear-to-b/oklch from-background to-muted/20 p-4">
			<Card className="w-full max-w-6xl overflow-hidden">
				<div className="flex flex-col lg:flex-row">
					{/* Preview Thumbnail */}
					<div className="relative aspect-video w-full overflow-hidden bg-muted lg:aspect-auto lg:w-1/2">
						<Image
							src={thumbnailUrl}
							width={1200}
							height={800}
							alt="Destination preview"
							className="h-full w-full object-cover"
						/>
					</div>

					{/* Content */}
					<div className="flex flex-col justify-center space-y-4 p-6 lg:w-1/2 lg:p-8">
						<div className="flex items-start gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<Shield className="h-5 w-5" />
							</div>
							<div className="flex-1 space-y-1">
								<h1 className="text-xl font-semibold">You're being redirected to:</h1>
								<p className="text-sm text-muted-foreground">
									Review the destination before continuing
								</p>
							</div>
						</div>

						<Separator />

						{/* URL Display */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="secondary" className="font-mono text-xs">
									<ExternalLink className="mr-1 h-3 w-3" />
									Destination URL
								</Badge>
							</div>
							<p className="rounded-md bg-muted px-3 py-2 text-sm font-medium break-all">
								{data.result.urlFull}
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2">
							<Button
								className="flex-1"
								size="lg"
								render={
									<Link to={data.result.urlFull}>
										Continue to Destination
										<ArrowRightFromLine className="ml-2 h-4 w-4" />
									</Link>
								}
							/>
						</div>

						<p className="text-center text-xs text-muted-foreground">
							Always verify links before clicking. Stay safe online.
						</p>
					</div>
				</div>
			</Card>
		</main>
	);
}
