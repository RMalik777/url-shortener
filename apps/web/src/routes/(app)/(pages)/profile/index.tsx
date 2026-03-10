import { useForm } from "@tanstack/react-form-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { LinkIcon, UnlinkIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { Spinner } from "@repo/ui/components/spinner";

import G from "@/assets/g_logo.svg";
import Github from "@/assets/github-mark.svg";

import { linkSocial, updateUser } from "@/lib/auth/auth-client";
import { acronym } from "@/lib/functions/utils";
import {
	getLinkedAccountsOptions,
	useLinkAccount,
	useUnlinkAccount,
	useUpdateUserName,
} from "@/lib/query/user";

export const Route = createFileRoute("/(app)/(pages)/profile/")({
	head: () => ({
		title: "Profile",
		meta: [
			{ title: "Profile" },
			{
				name: "description",
				content: "Manage your profile, password, and connected accounts.",
			},
		],
	}),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getLinkedAccountsOptions({ userId: context.user.id })),
	component: ProfilePage,
});

const socialProviders = [
	{ id: "google", name: "Google", logo: G },
	{ id: "github", name: "GitHub", logo: Github },
] as const;

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
		<div className="mx-auto max-w-2xl space-y-6 pb-12">
			<div>
				<h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
				<p className="text-muted-foreground">
					Manage your account settings and connected login methods.
				</p>
			</div>
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
											<FieldLabel
												htmlFor={field.name}
												className="mb-2 block text-sm font-medium text-slate-700"
											>
												Display Name
											</FieldLabel>
											<Input
												id={field.name}
												type="text"
												value={field.state.value}
												onChange={(e) => field.setValue(e.target.value)}
												placeholder="Your name"
												autoComplete="name"
											/>
											{isInvalid && (
												<p className="mt-1 text-sm text-red-600">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
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
	const { mutateAsync: unlinkAccountMutateAsync, isPending } = useUnlinkAccount({
		userId: user.id,
	});
	const { mutateAsync: linkAccountMutateAsync } = useLinkAccount({ userId: user.id });

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
					disabled={isPending || totalAccounts <= 1}
					onClick={async () => {
						try {
							const { error } = await linkAccountMutateAsync({ provider: provider.id });
							if (error) {
								toast.error(error.message ?? `Failed to connect ${provider.name}.`);
							} else {
								toast.success(`${provider.name} connected.`);
							}
						} catch {
							toast.error("An unexpected error occurred.");
						}
					}}
				>
					{isPending ? (
						<>
							<Spinner /> Disconnecting...
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
					disabled={isPending}
					onClick={async () => {
						if (totalAccounts <= 1) {
							toast.error("Cannot disconnect the only login method. Add another method first.");
							return;
						}
						try {
							const { error } = await unlinkAccountMutateAsync({ provider: provider.id });
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
					{isPending ? (
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
