import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { urls } from "@repo/db/schema";
import { Button } from "@repo/ui/components/button";

import type { FullFormSchemaType } from "@/lib/schema/url";
import { DataTable } from "@/components/table/data-table";
import { db } from "@/db";
import { fullColumn } from "@/lib/data/table/url";
import { authMiddleware } from "@/lib/middleware/auth";
import { urlQueryAll } from "@/lib/query/url";

import { EditCreateDialog } from "@/components/edit-create-dialog";

export const handleAddUrl = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: FullFormSchemaType) => input)
	.handler(async ({ context, data }) => {
		const isDuplicate = await db.select().from(urls).where(eq(urls.urlShort, data.urlShort)).get();
		if (isDuplicate) {
			throw new Error(
				JSON.stringify({
					message: "Short URL already exists. Please choose a different one.",
					location: "urlShort",
					code: "DUPLICATE_URL_SHORT",
				}),
			);
		}
		const parsedUrl =
			data.urlFull.startsWith("http") || data.urlFull.startsWith("https")
				? data.urlFull
				: `https://${data.urlFull}`;
		console.log("Data: ", data);
		await db.insert(urls).values({
			urlFull: parsedUrl,
			urlShort: data.urlShort,
			intermediaryScreen: data.intermediaryScreen,
			createdBy: context.id,
		});
	});
export const Route = createFileRoute("/(app)/(pages)/list/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [openDialog, setOpenDialog] = useState(false);
	const { user } = Route.useRouteContext();
	const { data: urlList } = useSuspenseQuery(urlQueryAll({ userId: user.id }));

	const mutation = useMutation({
		mutationFn: handleAddUrl,
	});

	return (
		<section>
			<h1>All Shortened URLs</h1>
			<EditCreateDialog action="create">
				<Button variant="outline">
					<PlusIcon />
					Add New URL
				</Button>
			</EditCreateDialog>
			<DataTable columns={fullColumn} data={urlList} />
		</section>
	);
}
