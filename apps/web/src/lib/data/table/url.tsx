import { Checkbox } from "@repo/ui/components/checkbox";

import type { Url } from "@repo/db/schema";

import type { ColumnDef } from "@tanstack/react-table";

import { ActionDropdown } from "@/components/table/action-dropdown";
import { DataTableColumnHeader } from "@/components/table/header";

const checkboxColumn: Array<ColumnDef<Url>> = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
	},
];
const actionColumn: Array<ColumnDef<Url>> = [
	{
		id: "actions",
		cell: ({ row }) => <ActionDropdown row={row} />,
	},
];
export const urlColumn: Array<ColumnDef<Url>> = [
	{
		accessorKey: "urlShort",
		enableSorting: true,
		header: ({ column }) => (
			<DataTableColumnHeader column={column} sorted={column.getIsSorted()} title="Short URL" />
		),
	},
	{
		accessorKey: "urlFull",
		enableSorting: true,
		header: ({ column }) => (
			<DataTableColumnHeader column={column} sorted={column.getIsSorted()} title="Original URL" />
		),
		cell: ({ row }) => {
			return (
				<a
					className="-m-1 p-1 text-left transition duration-200 ease-out hover:bg-muted hover:underline"
					href={row.original.urlFull}
					rel="noopener noreferrer"
				>
					{row.original.urlFull}
				</a>
			);
		},
	},
	...actionColumn,
];

export const fullColumn: Array<ColumnDef<Url>> = [
	...checkboxColumn,
	{
		accessorKey: "id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} sorted={column.getIsSorted()} title="ID" />
		),
		cell: ({ row }) => {
			return <code className="">{row.original.id}</code>;
		},
	},
	...urlColumn.slice(0, -1),
	{
		accessorKey: "intermediaryScreen",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				sorted={column.getIsSorted()}
				title="Intermediary Screen"
			/>
		),
		cell: ({ row }) => {
			return <>{row.original.intermediaryScreen ? "Yes" : "No"}</>;
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} sorted={column.getIsSorted()} title="Created At" />
		),
		cell: ({ row }) => {
			const formattedDate = new Date(row.original.createdAt).toLocaleString("en-ID", {
				dateStyle: "medium",
				timeStyle: "short",
			});
			return <div className="text-right">{formattedDate}</div>;
		},
	},
	{
		accessorKey: "isDeleted",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} sorted={column.getIsSorted()} title="Deleted" />
		),
		cell: ({ row }) => {
			return <>{row.original.isDeleted ? "Yes" : "No"}</>;
		},
	},
	{
		accessorKey: "deletedAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} sorted={column.getIsSorted()} title="Deleted At" />
		),
		cell: ({ row }) => {
			console.log(row.original.deletedAt, typeof row.original.deletedAt);
			if (!row.original.deletedAt) {
				return <div className="text-right">-</div>;
			}
			const formattedDate = new Date(row.original.deletedAt).toLocaleString("en-ID", {
				dateStyle: "medium",
				timeStyle: "short",
			});
			return <div className="text-right">{formattedDate}</div>;
		},
	},
	{
		accessorKey: "updatedAt",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				sorted={column.getIsSorted()}
				title="Last Updated At"
			/>
		),
		cell: ({ row }) => {
			if (row.original.updatedAt === row.original.createdAt) {
				return <div className="text-right">-</div>;
			}
			const formattedDate = new Date(row.original.updatedAt).toLocaleString(undefined, {
				dateStyle: "medium",
				timeStyle: "short",
			});
			return <div className="text-right">{formattedDate}</div>;
		},
	},
	...actionColumn,
];
