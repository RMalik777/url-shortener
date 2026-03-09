import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@repo/ui/components/button";

import { DataTable } from "@/components/table/data-table";
import { fullColumn } from "@/lib/data/table/url";
import { getAllUrlsOptions } from "@/lib/query/url";

import { EditCreateDialog } from "@/components/edit-create-dialog";

export const Route = createFileRoute("/(app)/(pages)/list/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const [, startTransition] = useTransition();

	const { data: urlList } = useSuspenseQuery(getAllUrlsOptions({ userId: user.id, page, limit }));

	const pageCount = urlList ? Math.ceil(urlList.total / limit) : 0;

	return (
		<section>
			<h1>All Shortened URLs</h1>
			<EditCreateDialog action="create">
				<Button variant="outline">
					<PlusIcon />
					Add New URL
				</Button>
			</EditCreateDialog>
			<DataTable
				columns={fullColumn}
				data={urlList?.rows ?? []}
				dataCount={urlList?.total ?? 0}
				pageIndex={page}
				pageSize={limit}
				pageCount={pageCount}
				onPageChange={(newPage) => startTransition(() => setPage(newPage))}
				onPageSizeChange={(newSize) => startTransition(() => setLimit(newSize))}
			/>{" "}
		</section>
	);
}
