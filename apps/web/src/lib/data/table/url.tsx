import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
	AlertTriangleIcon,
	ArchiveXIcon,
	ArrowUpRightFromSquareIcon,
	CopyIcon,
	ListXIcon,
	MoreHorizontalIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

import type { Url } from "@repo/db/schema";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/table/header";
import { deleteUrlbyId, hardDeleteUrlById } from "@/lib/functions/db";

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
			const queryClient = useQueryClient();
			const { user } = useRouteContext({ from: "/(app)" });
			const url = row.original;
			const [open, setOpen] = useState(false);
			const [hardDelete, setHardDelete] = useState(false);
			const [countDown, setCountDown] = useState(3);
			const [disableAction, setDisableAction] = useState(false);
			function startCountDown() {
				setDisableAction(true);
				let counter = 3;
				function tick() {
					counter -= 1;
					setCountDown(counter);
					if (counter === 0) {
						setDisableAction(false);
						clearInterval(interval);
					}
				}

				const interval = setInterval(tick, 1000);
			}
			return (
				<>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontalIcon className="h-4 w-4" />
								</Button>
							}
						/>
						<DropdownMenuContent align="end" className="w-fit">
							<DropdownMenuGroup>
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(url.id);
										toast.success("Copied URL ID to clipboard");
									}}
								>
									<CopyIcon />
									Copy URL ID
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(url.urlShort);
										toast.success("Copied Shortened URL to clipboard");
									}}
								>
									<CopyIcon />
									Copy Shortened URL
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(url.urlFull);
										toast.success("Copied Original URL to clipboard");
									}}
								>
									<CopyIcon />
									Copy Original URL
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									render={
										<Link to="/list/$id" params={{ id: url.id }}>
											<ArrowUpRightFromSquareIcon />
											View details
										</Link>
									}
								/>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuLabel>Delete</DropdownMenuLabel>
									<DropdownMenuItem variant="destructive" onClick={() => setOpen(true)}>
										<ArchiveXIcon />
										Soft Delete
									</DropdownMenuItem>
									<DropdownMenuItem
										variant="destructive"
										onClick={() => {
											setHardDelete(true);
											setOpen(true);
											setCountDown(3);
											startCountDown();
										}}
									>
										<Trash2Icon />
										Hard Delete
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<AlertDialog open={open} onOpenChange={setOpen}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
									<ListXIcon />
								</AlertDialogMedia>
								<AlertDialogTitle>Are You Sure You Want to Delete This URL?</AlertDialogTitle>
								<AlertDialogDescription>
									{hardDelete
										? "This action cannot be undone. Make sure you really want to proceed."
										: "This action cannot be undone. This will delete the URL from our servers."}
									{hardDelete && (
										<Alert className="max-w-md border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
											<AlertTriangleIcon />
											<AlertTitle>Warning!</AlertTitle>
											<AlertDescription>
												Hard delete PERMANENTLY remove data from database.
											</AlertDescription>
										</Alert>
									)}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
								<AlertDialogAction
									disabled={hardDelete && disableAction}
									variant="destructive"
									onClick={async () => {
										try {
											if (hardDelete) {
												await hardDeleteUrlById({ data: url.id });
											} else {
												await deleteUrlbyId({ data: url.id });
											}
											setOpen(false);
											toast.success("URL deleted successfully");
											await Promise.all([
												queryClient.invalidateQueries({ queryKey: [user.id, "urls", "all"] }),
												queryClient.invalidateQueries({ queryKey: [user.id, "urls", url.id] }),
											]);
										} catch (error) {
											console.log(error);
											toast.error("Failed to delete URL. Please try again.");
										}
									}}
								>
									Delete{disableAction ? ` (${countDown})` : ""}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</>
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
