import { Link, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
	AlertTriangleIcon,
	ArchiveXIcon,
	ArrowUpRightFromSquareIcon,
	CopyIcon,
	ListXIcon,
	MoreHorizontalIcon,
	Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import type { Url } from "@repo/db/schema";
import type { Row } from "@tanstack/react-table";

import { useDeleteUrlById, useHardDeleteUrlById } from "@/lib/query/url";

export function ActionDropdown({ row }: Readonly<{ row: Row<Url> }>) {
	const { user } = useRouteContext({ from: "/(app)" });

	const deleteUrlMutation = useDeleteUrlById({ userId: user.id });
	const hardDeleteUrlMutation = useHardDeleteUrlById({ userId: user.id });

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
										await hardDeleteUrlMutation.mutateAsync({ data: url.id });
									} else {
										await deleteUrlMutation.mutateAsync({ data: url.id });
									}
									setOpen(false);
									toast.success("URL deleted successfully");
								} catch (error) {
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
}
