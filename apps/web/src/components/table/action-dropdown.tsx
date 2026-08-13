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
	MoreHorizontalIcon,
	Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import type { Url } from "@repo/db/schema";
import type { Row } from "@tanstack/react-table";

import type { features } from "@/lib/data/table/features";
import { env } from "@/env";
import { copyToClipboard } from "@/lib/functions/clipboard";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { useDeleteUrlById, useHardDeleteUrlById } from "@/lib/query/url";

/** Seconds the hard-delete confirm button stays disabled. */
const HARD_DELETE_DELAY = 3;

export function ActionDropdown({ row }: Readonly<{ row: Row<typeof features, Url> }>) {
	const { user } = useRouteContext({ from: "/(app)" });

	const deleteUrlMutation = useDeleteUrlById({ userId: user.id });
	const hardDeleteUrlMutation = useHardDeleteUrlById({ userId: user.id });

	const url = row.original;
	const [open, setOpen] = useState(false);
	const [hardDelete, setHardDelete] = useState(false);
	const { count, active: countingDown, start, reset } = useCountdown(HARD_DELETE_DELAY);

	const shortUrl = `${env.VITE_SHORT_URL}${url.urlShort}`;

	function closeDialog() {
		setOpen(false);
		reset();
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button variant="ghost" size="icon-sm">
							<span className="sr-only">Open menu</span>
							<MoreHorizontalIcon />
						</Button>
					}
				/>
				<DropdownMenuContent align="end" className="w-fit">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => copyToClipboard(url.id, "URL ID")}>
							<CopyIcon />
							Copy URL ID
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => copyToClipboard(shortUrl, "Short URL")}>
							<CopyIcon />
							Copy short URL
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => copyToClipboard(url.urlFull, "Original URL")}>
							<CopyIcon />
							Copy original URL
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
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									setHardDelete(false);
									reset();
									setOpen(true);
								}}
							>
								<ArchiveXIcon />
								Soft delete
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									setHardDelete(true);
									setOpen(true);
									start();
								}}
							>
								<Trash2Icon />
								Hard delete
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) reset();
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10 text-destructive">
							{hardDelete ? <Trash2Icon /> : <ArchiveXIcon />}
						</AlertDialogMedia>
						<AlertDialogTitle>
							{hardDelete ? "Permanently delete this link?" : "Soft delete this link?"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{hardDelete
								? "This cannot be undone. The link and all its data are removed for good."
								: "The link stops redirecting and moves to your deleted links. You can restore it later."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					{hardDelete && (
						<Alert variant="destructive">
							<AlertTriangleIcon />
							<AlertTitle>This is permanent</AlertTitle>
							<AlertDescription>
								Hard delete removes the row from the database. There is no restore.
							</AlertDescription>
						</Alert>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={
								(hardDelete && countingDown) ||
								deleteUrlMutation.isPending ||
								hardDeleteUrlMutation.isPending
							}
							variant="destructive"
							onClick={async () => {
								try {
									if (hardDelete) {
										await hardDeleteUrlMutation.mutateAsync({ data: url.id });
									} else {
										await deleteUrlMutation.mutateAsync({ data: url.id });
									}
									closeDialog();
									toast.success(hardDelete ? "Link permanently deleted" : "Link deleted");
								} catch (error) {
									toast.error(
										error instanceof Error ? error.message : "Could not delete this link.",
									);
								}
							}}
						>
							Delete{hardDelete && countingDown ? ` (${count})` : ""}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
