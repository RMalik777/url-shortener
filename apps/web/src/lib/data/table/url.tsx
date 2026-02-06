import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Checkbox } from "@repo/ui/components/checkbox";

import type { Url } from "@repo/db/schema";

import type { ColumnDef } from "@tanstack/react-table";

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
		cell: ({ row }) => {
			const url = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						<DropdownMenuGroup>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(url.id);
									toast.success("Copied URL ID to clipboard");
								}}
							>
								Copy URL ID
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(url.urlShort);
									toast.success("Copied Shortened URL to clipboard");
								}}
							>
								Copy Shortened URL
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(url.urlFull);
									toast.success("Copied Original URL to clipboard");
								}}
							>
								Copy Original URL
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>View details</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
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
		header: "ID",
	},
	...urlColumn.slice(0, -1),
	{
		accessorKey: "clicked",
		header: "Clicks",
	},
	{
		accessorKey: "intermediaryScreen",
		header: "Intermediary Screen",
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
	},
	{
		accessorKey: "isDeleted",
		header: "Deleted",
	},
	{
		accessorKey: "deletedAt",
		header: "Deleted At",
	},
	{
		accessorKey: "updatedAt",
		header: "Updated At",
	},
	...actionColumn,
];
