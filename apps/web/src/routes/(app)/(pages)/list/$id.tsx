import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
	ArchiveXIcon,
	ArrowLeftIcon,
	CheckIcon,
	CopyIcon,
	ExternalLinkIcon,
	EyeIcon,
	LinkIcon,
	MousePointerClickIcon,
	PencilIcon,
	ShieldCheckIcon,
	Trash2Icon,
	Undo2,
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
import { Separator } from "@repo/ui/components/separator";

import { env } from "@/env";
import { deleteUrlbyId, hardDeleteUrlById, restoreUrlById } from "@/lib/functions/db";
import { urlQueryById } from "@/lib/query/url";
import { EditCreateDialog } from "@/components/edit-create-dialog";

export const Route = createFileRoute("/(app)/(pages)/list/$id")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(urlQueryById({ id: params.id, userId: context.user.id })),
	component: RouteComponent,
});

function CopyButton({ text, label }: { text: string; label: string }) {
	const [copied, setCopied] = useState(false);

	return (
		<Button
			variant="ghost"
			size="icon-sm"
			aria-label={`Copy ${label}`}
			onClick={() => {
				navigator.clipboard.writeText(text);
				setCopied(true);
				toast.success(`Copied ${label} to clipboard`);
				setTimeout(() => setCopied(false), 2000);
			}}
		>
			{copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
		</Button>
	);
}

function StatCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<Card size="sm">
			<CardContent className="flex items-center gap-3">
				<div className="flex size-8 items-center justify-center bg-muted text-muted-foreground">
					{icon}
				</div>
				<div className="min-w-0">
					<p className="text-base text-muted-foreground">{label}</p>
					<p className="truncate text-sm font-medium">{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { id } = Route.useParams();
	const { data: url } = useSuspenseQuery(urlQueryById({ id: id, userId: user.id }));
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [deleteOpen, setDeleteOpen] = useState(false);
	const [hardDelete, setHardDelete] = useState(false);
	const [countDown, setCountDown] = useState(3);
	const [disableAction, setDisableAction] = useState(false);

	function startCountDown() {
		setDisableAction(true);
		const interval = setInterval(() => {
			setCountDown((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					setDisableAction(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}

	if (!url) {
		return (
			<main className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 px-4 py-20">
				<h1 className="text-xl font-medium">URL not found</h1>
				<p className="text-sm text-muted-foreground">
					The URL you're looking for doesn't exist or you don't have access to it.
				</p>
				<Button variant="outline" nativeButton={false} render={<Link to="/list" />}>
					<ArrowLeftIcon /> Back to list
				</Button>
			</main>
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
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return "Just now";
	};

	return (
		<main className="mx-auto flex flex-col gap-6 px-2 py-6 sm:px-4 sm:py-10 lg:px-8 xl:px-16">
			<div className="flex flex-col gap-4">
				<Button
					variant="ghost"
					size="sm"
					className="w-fit"
					nativeButton={false}
					render={<Link to="/list" />}
				>
					<ArrowLeftIcon /> Back to list
				</Button>

				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-lg font-semibold tracking-tight">URL Details</h1>
						{url.isDeleted ? (
							<Badge variant="destructive">Deleted</Badge>
						) : (
							<Badge variant="secondary">Active</Badge>
						)}
					</div>
					<div className="flex flex-row items-center gap-1">
						<p className="font-mono text-sm text-muted-foreground">{url.id}</p>
						<Button
							variant="ghost"
							size="icon-xs"
							onClick={() => {
								navigator.clipboard.writeText(url.id);
								toast.success("Copied URL ID to clipboard");
							}}
						>
							<CopyIcon className="text-muted-foreground" />
							<span className="sr-only">Copy URL ID</span>
						</Button>
					</div>
				</div>
			</div>

			<div className="grid gap-3">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<LinkIcon className="h-full w-auto bg-muted p-2 text-muted-foreground" />
							<div className="flex flex-col">
								<CardDescription>Short URL</CardDescription>
								<CardTitle>{shortUrl}</CardTitle>
							</div>
						</div>
						<CardAction>
							<CopyButton text={shortUrl} label="short URL" />
							<Button
								variant="ghost"
								size="icon-sm"
								nativeButton={false}
								render={
									<a href={shortUrl} target="_blank" rel="noopener noreferrer">
										<ExternalLinkIcon className="size-3.5" />
									</a>
								}
							/>
						</CardAction>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<MousePointerClickIcon className="h-full w-auto bg-muted p-2 text-muted-foreground" />
							<div className="flex flex-col">
								<CardDescription>Original URL</CardDescription>
								<CardTitle>
									<a className="hover:underline" href={url.urlFull}>
										{url.urlFull}
									</a>
								</CardTitle>
							</div>
						</div>
						<CardAction>
							<CopyButton text={url.urlFull} label="original URL" />
							<Button
								variant="ghost"
								size="icon-sm"
								nativeButton={false}
								render={
									<a href={url.urlFull} target="_blank" rel="noopener noreferrer">
										<ExternalLinkIcon className="size-3.5" />
									</a>
								}
							/>
						</CardAction>
					</CardHeader>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<StatCard
					icon={<EyeIcon className="size-4" />}
					label="Intermediary Screen"
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
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Created</span>
							<div className="flex items-center gap-2 text-right">
								<span className="text-sm font-medium">{formatDate(createdDate)}</span>

								<span className="text-xs text-muted-foreground">{formatRelative(createdDate)}</span>
							</div>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Last updated</span>
							<div className="flex items-center gap-2 text-right">
								<span className="text-sm font-medium">{formatDate(updatedDate)}</span>
								<span className="text-xs text-muted-foreground">{formatRelative(updatedDate)}</span>
							</div>
						</div>
						{url.isDeleted && (
							<>
								<Separator />
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Deleted</span>
									<div className="flex items-center gap-2 text-right">
										<span className="text-sm font-medium">{formatDate(deletedDate)}</span>
										{deletedDate && (
											<span className="text-xs text-muted-foreground">
												{formatRelative(deletedDate)}
											</span>
										)}
									</div>
								</div>
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
							onClick={async () => {
								try {
									await restoreUrlById({ data: url.id });
									toast.success("URL restored successfully");
									await queryClient.invalidateQueries({ queryKey: [user.id, "urls"] });
								} catch (error) {
									console.error(error);
									toast.error("Failed to restore URL. Please try again.");
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
								setDeleteOpen(true);
							}}
						>
							<ArchiveXIcon /> Soft Delete
						</Button>
					)}
					<Button
						variant="destructive"
						size="sm"
						onClick={() => {
							setHardDelete(true);
							setDeleteOpen(true);
							setCountDown(3);
							startCountDown();
						}}
					>
						<Trash2Icon /> Hard Delete
					</Button>
				</CardFooter>
			</Card>

			{/* Delete Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
							{hardDelete ? <Trash2Icon /> : <ArchiveXIcon />}
						</AlertDialogMedia>
						<AlertDialogTitle>
							{hardDelete ? "Permanently delete this URL?" : "Soft delete this URL?"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{hardDelete
								? "This action cannot be undone. The URL and all its data will be permanently removed."
								: "The URL will be marked as deleted and won't redirect anymore. You can restore it later."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
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
									setDeleteOpen(false);
									toast.success("URL deleted successfully");
									await Promise.all([
										queryClient.invalidateQueries({ queryKey: [user.id, "urls", "all"] }),
										queryClient.invalidateQueries({ queryKey: [user.id, "urls", url.id] }),
									]);
									if (hardDelete) {
										navigate({ to: "/list" });
									}
								} catch (error) {
									console.error(error);
									toast.error("Failed to delete URL. Please try again.");
								}
							}}
						>
							Delete{disableAction && hardDelete ? ` (${countDown})` : ""}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}
