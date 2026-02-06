import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/table/data-table";
import { fullColumn } from "@/lib/data/table/url";

export const Route = createFileRoute("/(app)/list/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { urlList } = Route.useRouteContext();
	return (
		<section>
			<DataTable columns={fullColumn} data={urlList} />
		</section>
	);
}
