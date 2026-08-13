import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
	ArchiveXIcon,
	ArrowLeftIcon,
	ExternalLinkIcon,
	EyeIcon,
	LinkIcon,
	MousePointerClickIcon,
	PencilIcon,
	ShieldCheckIcon,
	Trash2Icon,
	Undo2Icon,
} from "lucide-react";

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
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { CopyButton } from "@repo/ui/components/custom/copy-button";
import { Separator } from "@repo/ui/components/separator";

import { EditCreateDialog } from "@/components/edit-create-dialog";
import { PageHeader } from "@/components/page-header";
import { env } from "@/env";
import { useCountdown } from "@/lib/hooks/use-countdown";
import {
	getUrlByIdOptions,
	useDeleteUrlById,
	useHardDeleteUrlById,
	useRestoreUrlById,
} from "@/lib/query/url";

/** Seconds the hard-delete confirm button stays disabled. */
const HARD_DELETE_DELAY = 3;

export const Route = createFileRoute("/(app)/(pages)/list/$id")({
	head: () => ({
		title: "URL Details | URL Shortener",
		meta: [
			{ title: "URL Details | URL Shortener" },
			{
				name: "description",
				content: "View and manage the details of your shortened URL.",
			},
		],
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(
			getUrlByIdOptions({ id: params.id, userId: context.user.id }),
		),
	component: RouteComponent,
});

function StatCard({
	icon,
	label,
	value,
}: Readonly<{
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}>) {
	return (
		<Card size="sm">
			<CardContent className="flex items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center bg-muted text-muted-foreground">
					{icon}
				</div>
				<div className="min-w-0">
					<p className="text-xs text-muted-foreground">{label}</p>
					<p className="truncate text-sm font-medium">{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function TimelineRow({
	label,
	date,
	formatDate,
	formatRelative,
}: Readonly<{
	label: string;
	date: Date | null;
	formatDate: (date: Date | null) => string;
	formatRelative: (date: Date | null) => string;
}>) {
	return (
		<div className="flex items-center justify-between gap-2">
			<span className="text-sm text-muted-foreground">{label}</span>
			<div className="flex items-center gap-2 text-right">
				<span className="text-sm font-medium">{formatDate(date)}</span>
				<span className="text-xs text-muted-foreground">{formatRelative(date)}</span>
			</div>
		</div>
	);
}

function RouteComponent() {
	const navigate = useNavigate();
	const { user } = Route.useRouteContext();
	const { id } = Route.useParams();
	const { data: url } = useSuspenseQuery(getUrlByIdOptions({ id: id, userId: user.id }));

	const deleteUrlbyIdMutation = useDeleteUrlById({ userId: user.id });
	const hardDeleteUrlByIdMutation = useHardDeleteUrlById({ userId: user.id });
	const restoreUrlByIdMutation = useRestoreUrlById({ userId: user.id });

	const [deleteOpen, setDeleteOpen] = useState(false);
	const [hardDelete, setHardDelete] = useState(false);
	const { count, active: countingDown, start, reset } = useCountdown(HARD_DELETE_DELAY);

	function closeDialog() {
		setDeleteOpen(false);
		reset();
	}

	if (!url) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
				<h1 className="text-lg font-semibold tracking-tight">URL not found</h1>
				<p className="text-sm text-muted-foreground">
					This link doesn't exist, or it belongs to another account.
				</p>
				<Button variant="outline" nativeButton={false} render={<Link to="/list" />}>
					<ArrowLeftIcon /> Back to list
				</Button>
			</div>
		);
	}

	const shortUrl = env.VITE_SHORT_URL + url.urlShort;
	const createdDate = new Date(url.createdAt);
	const updatedDate = new Date(url.updatedAt);
	const deletedDate = url.deletedAt ? new Date(url.deletedAt) : null;

	const formatDate = (date: Date | null) => {
		if (!date) return "—";
		return new Intl.DateTimeFormat("en-ID", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(date);
	};

	const formatRelative = (date: Date | null) => {
		if (!date) return "";
		const diff = Date.now() - date.getTime();
		const minutes = Math.floor(diff / 60_000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return "Just now";
	};

	return (
		<div className="flex flex-col gap-6">
			<Button
				variant="ghost"
				size="sm"
				className="w-fit"
				nativeButton={false}
				render={<Link to="/list" />}
			>
				<ArrowLeftIcon /> Back to list
			</Button>

			<PageHeader
				title="URL details"
				description={
					<span className="flex items-center gap-1">
						<span className="truncate font-mono text-xs">{url.id}</span>
						<CopyButton value={url.id} label="URL ID" />
					</span>
				}
			>
				{url.isDeleted ? (
					<Badge variant="destructive">Deleted</Badge>
				) : (
					<Badge variant="secondary">Active</Badge>
				)}
			</PageHeader>

			<div className="grid gap-3">
				<Card>
					<CardHeader>
						<div className="flex min-w-0 items-center gap-2">
							<LinkIcon className="size-8 shrink-0 bg-muted p-2 text-muted-foreground" />
							<div className="flex min-w-0 flex-col">
								<CardDescription>Short URL</CardDescription>
								<CardTitle className="truncate">{shortUrl}</CardTitle>
							</div>
						</div>
						<CardAction>
							<div className="flex items-center gap-1">
								<CopyButton value={shortUrl} label="Short URL" size="icon-sm" />
								<Button
									variant="ghost"
									size="icon-sm"
									nativeButton={false}
									render={
										<a href={shortUrl} target="_blank" rel="noopener noreferrer">
											<ExternalLinkIcon className="size-3.5" />
											<span className="sr-only">Open short URL</span>
										</a>
									}
								/>
							</div>
						</CardAction>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex min-w-0 items-center gap-2">
							<MousePointerClickIcon className="size-8 shrink-0 bg-muted p-2 text-muted-foreground" />
							<div className="flex min-w-0 flex-col">
								<CardDescription>Original URL</CardDescription>
								<CardTitle className="truncate">
									<a
										className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
										href={url.urlFull}
										target="_blank"
										rel="noopener noreferrer"
									>
										{url.urlFull}
									</a>
								</CardTitle>
							</div>
						</div>
						<CardAction>
							<div className="flex items-center gap-1">
								<CopyButton value={url.urlFull} label="Original URL" size="icon-sm" />
								<Button
									variant="ghost"
									size="icon-sm"
									nativeButton={false}
									render={
										<a href={url.urlFull} target="_blank" rel="noopener noreferrer">
											<ExternalLinkIcon className="size-3.5" />
											<span className="sr-only">Open original URL</span>
										</a>
									}
								/>
							</div>
						</CardAction>
					</CardHeader>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<StatCard
					icon={<EyeIcon className="size-4" />}
					label="Intermediary screen"
					value={url.intermediaryScreen ? "Enabled" : "Disabled"}
				/>
				<StatCard
					icon={<ShieldCheckIcon className="size-4" />}
					label="Status"
					value={url.isDeleted ? "Deleted" : "Active"}
				/>
			</div>

			<Card>
				<CardHeader className="border-b">
					<CardTitle>Timeline</CardTitle>
				</CardHeader>
				<CardContent className="py-3">
					<div className="grid gap-3">
						<TimelineRow
							label="Created"
							date={createdDate}
							formatDate={formatDate}
							formatRelative={formatRelative}
						/>
						<Separator />
						<TimelineRow
							label="Last updated"
							date={updatedDate}
							formatDate={formatDate}
							formatRelative={formatRelative}
						/>
						{url.isDeleted && (
							<>
								<Separator />
								<TimelineRow
									label="Deleted"
									date={deletedDate}
									formatDate={formatDate}
									formatRelative={formatRelative}
								/>
							</>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b">
					<CardTitle>Actions</CardTitle>
				</CardHeader>
				<CardFooter className="flex flex-wrap gap-2 py-3">
					<EditCreateDialog action="edit" prevData={url}>
						<Button variant="outline" size="sm">
							<PencilIcon />
							Edit
						</Button>
					</EditCreateDialog>
					{url.isDeleted ? (
						<Button
							variant="outline"
							size="sm"
							disabled={restoreUrlByIdMutation.isPending}
							onClick={async () => {
								try {
									await restoreUrlByIdMutation.mutateAsync({ data: url.id });
									toast.success("Link restored");
								} catch (error) {
									toast.error(
										error instanceof Error ? error.message : "Could not restore this link.",
									);
								}
							}}
						>
							<Undo2Icon />
							Restore
						</Button>
					) : (
						<Button
							variant="destructive"
							size="sm"
							onClick={() => {
								setHardDelete(false);
								reset();
								setDeleteOpen(true);
							}}
						>
							<ArchiveXIcon /> Soft delete
						</Button>
					)}
					<Button
						variant="destructive"
						size="sm"
						onClick={() => {
							setHardDelete(true);
							setDeleteOpen(true);
							start();
						}}
					>
						<Trash2Icon /> Hard delete
					</Button>
				</CardFooter>
			</Card>

			<AlertDialog
				open={deleteOpen}
				onOpenChange={(open) => {
					setDeleteOpen(open);
					if (!open) reset();
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
					<AlertDialogFooter>
						<AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={
								(hardDelete && countingDown) ||
								deleteUrlbyIdMutation.isPending ||
								hardDeleteUrlByIdMutation.isPending
							}
							variant="destructive"
							onClick={async () => {
								try {
									if (hardDelete) {
										await hardDeleteUrlByIdMutation.mutateAsync({ data: url.id });
									} else {
										await deleteUrlbyIdMutation.mutateAsync({ data: url.id });
									}
									closeDialog();
									toast.success(hardDelete ? "Link permanently deleted" : "Link deleted");
									if (hardDelete) {
										navigate({ to: "/list" });
									}
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
		</div>
	);
}
