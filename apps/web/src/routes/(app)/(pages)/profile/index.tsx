import { useState } from "react";

import { useForm } from "@tanstack/react-form-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { FingerprintPattern, LinkIcon, PlusIcon, Trash2Icon, UnlinkIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
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
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";

import G from "@/assets/g_logo.svg";
import Github from "@/assets/github-mark.svg";

import { PageHeader } from "@/components/page-header";
import { acronym } from "@/lib/functions/utils";
import {
	getLinkedAccountsOptions,
	getPasskeysOptions,
	useAddPasskey,
	useDeletePasskey,
	useLinkAccount,
	useUnlinkAccount,
	useUpdateUserName,
} from "@/lib/query/user";

export const Route = createFileRoute("/(app)/(pages)/profile/")({
	head: () => ({
		title: "Profile | URL Shortener",
		meta: [
			{ title: "Profile | URL Shortener" },
			{
				name: "description",
				content: "Manage your profile, password, and connected accounts.",
			},
		],
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(getLinkedAccountsOptions({ userId: context.user.id })),
			context.queryClient.ensureQueryData(getPasskeysOptions({ userId: context.user.id })),
		]),
	component: ProfilePage,
});

const socialProviders = [
	{ id: "google", name: "Google", logo: G },
	{ id: "github", name: "GitHub", logo: Github },
] as const;

const passkeyDateFormat = new Intl.DateTimeFormat("en-ID", { dateStyle: "medium" });

const formSchema = z.object({
	name: z.string().min(1, "Name cannot be empty."),
});

function ProfilePage() {
	const { user } = Route.useRouteContext();
	const { data: accounts } = useSuspenseQuery(getLinkedAccountsOptions({ userId: user.id }));
	const { mutateAsync: mutateAsyncUpdateName, isPending } = useUpdateUserName({ userId: user.id });

	const form = useForm({
		defaultValues: { name: user.name },
		validators: {
			onBlur: formSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await mutateAsyncUpdateName(value.name);
				toast.success("Name updated successfully.");
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Failed to update name.");
			}
		},
	});

	return (
		<div className="mx-auto flex max-w-2xl flex-col gap-6">
			<PageHeader
				title="Profile"
				description="Manage your account settings and connected login methods."
			/>
			<Card>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="contents"
				>
					<CardHeader>
						<CardTitle>Profile Information</CardTitle>
						<CardDescription>
							Update your display name and view your account details.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FieldGroup className="gap-6">
							<div className="flex items-center gap-4">
								<Avatar size="lg" className="size-16">
									<AvatarImage src={user.image ?? ""} alt={user.name} />
									<AvatarFallback className="text-lg">{acronym(user.name)}</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="text-sm font-medium">{user.name}</span>
									<span className="text-sm text-muted-foreground">{user.email}</span>
								</div>
							</div>

							<form.Field name="name">
								{(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
											<Input
												id={field.name}
												type="text"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.setValue(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Your name"
												autoComplete="name"
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="justify-end gap-2 border-t">
						<Button type="submit" disabled={isPending}>
							{isPending && <Spinner />}Save Changes
						</Button>
					</CardFooter>
				</form>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Connected Accounts</CardTitle>
					<CardDescription>
						Manage the social accounts linked to your profile for login.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="divide-y">
						{socialProviders.map((provider) => {
							const linked = accounts.find((a) => a.providerId === provider.id);
							return (
								<SocialAccountRow
									key={provider.id}
									provider={provider}
									linked={linked}
									totalAccounts={accounts.length}
								/>
							);
						})}
					</div>
				</CardContent>
			</Card>
			<PasskeysCard />
		</div>
	);
}

function PasskeysCard() {
	const { user } = Route.useRouteContext();
	const { data: passkeys } = useSuspenseQuery(getPasskeysOptions({ userId: user.id }));
	const { mutateAsync: addPasskeyMutateAsync, isPending: isAdding } = useAddPasskey({
		userId: user.id,
	});
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");

	return (
		<Card>
			<CardHeader>
				<CardTitle>Passkeys</CardTitle>
				<CardDescription>
					Sign in with your fingerprint, face, screen lock, or a security key.
				</CardDescription>
				<CardAction>
					<Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={() => setName("")}>
						<DialogTrigger
							render={
								<Button variant="outline" size="sm">
									<PlusIcon /> Add
								</Button>
							}
						/>
						<DialogContent>
							<form
								className="contents"
								onSubmit={async (e) => {
									e.preventDefault();
									try {
										const { error } = await addPasskeyMutateAsync({
											name: name.trim() || undefined,
										});
										if (error) {
											toast.error(error.message ?? "Failed to add passkey.");
										} else {
											setOpen(false);
											toast.success("Passkey added.");
										}
									} catch (err) {
										toast.error(err instanceof Error ? err.message : "Failed to add passkey.");
									}
								}}
							>
								<DialogHeader>
									<DialogTitle>Add a passkey</DialogTitle>
									<DialogDescription>
										Your browser will ask you to confirm with your device or security key.
									</DialogDescription>
								</DialogHeader>
								<Field>
									<FieldLabel htmlFor="passkey-name">Name</FieldLabel>
									<Input
										id="passkey-name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="e.g. MacBook Touch ID"
										maxLength={64}
										autoComplete="off"
									/>
									<FieldDescription>Optional. Helps you tell your passkeys apart.</FieldDescription>
								</Field>
								<DialogFooter>
									<DialogClose render={<Button variant="outline" disabled={isAdding} />}>
										Cancel
									</DialogClose>
									<Button type="submit" disabled={isAdding}>
										{isAdding && <Spinner />}Continue
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</CardAction>
			</CardHeader>
			<CardContent>
				{passkeys.length === 0 ? (
					<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
						<div className="flex size-10 items-center justify-center rounded-lg border bg-background">
							<FingerprintPattern className="size-5 text-muted-foreground" />
						</div>
						<p className="text-sm font-medium">No passkeys yet</p>
						<p className="max-w-xs text-xs text-balance text-muted-foreground">
							Add a passkey to sign in without Google or GitHub.
						</p>
					</div>
				) : (
					<div className="divide-y">
						{passkeys.map((pk) => (
							<PasskeyRow key={pk.id} passkey={pk} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function PasskeyRow({
	passkey,
}: Readonly<{
	passkey: {
		id: string;
		name: string | null;
		deviceType: string;
		backedUp: boolean;
		createdAt: Date | null;
	};
}>) {
	const { user } = Route.useRouteContext();
	const { mutateAsync: deletePasskeyMutateAsync, isPending: isDeleting } = useDeletePasskey({
		userId: user.id,
	});
	const details = [
		passkey.backedUp ? "Synced" : "Device-bound",
		passkey.createdAt && `Added ${passkeyDateFormat.format(new Date(passkey.createdAt))}`,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-lg border bg-background">
					<FingerprintPattern className="size-5" />
				</div>
				<div>
					<p className="text-sm font-medium">{passkey.name || "Passkey"}</p>
					<p className="text-xs text-muted-foreground">{details}</p>
				</div>
			</div>
			<Button
				variant="outline"
				size="sm"
				disabled={isDeleting}
				onClick={async () => {
					try {
						const { error } = await deletePasskeyMutateAsync({ id: passkey.id });
						if (error) {
							toast.error(error.message ?? "Failed to remove passkey.");
						} else {
							toast.success("Passkey removed.");
						}
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Failed to remove passkey.");
					}
				}}
			>
				{isDeleting ? (
					<>
						<Spinner /> Removing
					</>
				) : (
					<>
						<Trash2Icon /> Remove
					</>
				)}
			</Button>
		</div>
	);
}

function SocialAccountRow({
	provider,
	linked,
	totalAccounts,
}: Readonly<{
	provider: (typeof socialProviders)[number];
	linked?: { id: string; providerId: string; accountId: string };
	totalAccounts: number;
}>) {
	const { user } = Route.useRouteContext();
	const { mutateAsync: unlinkAccountMutateAsync, isPending: isUnlinking } = useUnlinkAccount({
		userId: user.id,
	});
	const { mutateAsync: linkAccountMutateAsync, isPending: isLinking } = useLinkAccount({
		userId: user.id,
	});
	const isLastMethod = totalAccounts <= 1;

	return (
		<div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-lg border bg-background">
					<Image
						src={provider.logo}
						alt={`${provider.name} logo`}
						width={20}
						height={20}
						className="size-5"
					/>
				</div>
				<div>
					<p className="text-sm font-medium">{provider.name}</p>
					<p className="text-xs text-muted-foreground">{linked ? "Connected" : "Not connected"}</p>
				</div>
			</div>
			{linked ? (
				<Button
					variant="outline"
					size="sm"
					disabled={isUnlinking || isLastMethod}
					title={
						isLastMethod ? "Add another login method before disconnecting this one." : undefined
					}
					onClick={async () => {
						if (isLastMethod) {
							toast.error("Add another login method before disconnecting this one.");
							return;
						}
						try {
							const { error } = await unlinkAccountMutateAsync({ accountId: linked.id });
							if (error) {
								toast.error(error.message ?? `Failed to disconnect ${provider.name}.`);
							} else {
								toast.success(`${provider.name} disconnected.`);
							}
						} catch (err) {
							toast.error(
								err instanceof Error ? err.message : `Failed to disconnect ${provider.name}.`,
							);
						}
					}}
				>
					{isUnlinking ? (
						<>
							<Spinner /> Disconnecting
						</>
					) : (
						<>
							<UnlinkIcon /> Disconnect
						</>
					)}
				</Button>
			) : (
				<Button
					variant="outline"
					size="sm"
					disabled={isLinking}
					onClick={async () => {
						try {
							const { error } = await linkAccountMutateAsync({ provider: provider.id });
							if (error) {
								toast.error(error.message ?? `Failed to connect ${provider.name}.`);
							}
						} catch (err) {
							toast.error(
								err instanceof Error ? err.message : `Failed to connect ${provider.name}.`,
							);
						}
					}}
				>
					{isLinking ? (
						<>
							<Spinner /> Connecting
						</>
					) : (
						<>
							<LinkIcon />
							Connect
						</>
					)}
				</Button>
			)}
		</div>
	);
}
