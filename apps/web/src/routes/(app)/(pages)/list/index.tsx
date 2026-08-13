import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { Button } from "@repo/ui/components/button";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/table/data-table";
import { fullColumn } from "@/lib/data/table/url";
import { getAllUrlsOptions } from "@/lib/query/url";

import { EditCreateDialog } from "@/components/edit-create-dialog";

export const Route = createFileRoute("/(app)/(pages)/list/")({
	component: RouteComponent,
	head: () => ({
		title: "URL List | URL Shortener",
		meta: [
			{ title: "URL List | URL Shortener" },
			{
				name: "description",
				content: "View and manage all your shortened URLs.",
			},
		],
	}),
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { data: urls } = useSuspenseQuery(getAllUrlsOptions({ userId: user.id }));

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="All links"
				description="Search, sort, and manage every link you've created."
			>
				<EditCreateDialog action="create">
					<Button variant="outline">
						<PlusIcon />
						Add new link
					</Button>
				</EditCreateDialog>
			</PageHeader>
			<DataTable
				columns={fullColumn}
				data={urls}
				initialPageSize={10}
				enableRowSelection
				searchPlaceholder="Search links"
			/>
		</div>
	);
}
