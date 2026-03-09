import { useForm } from "@tanstack/react-form-start";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

import type { Url } from "@repo/db/schema";
import type { FullFormSchemaType } from "@/lib/schema/url";

import { env } from "@/env";
import { useEditUrlById, useInsertUrl } from "@/lib/query/url";
import { fullFormOpts, fullFormSchemaServer } from "@/lib/schema/url";
import { DBError } from "@/lib/types/error";

type EditCreateDialogProps =
	| { action: "create"; prevData?: never; children: React.ReactElement }
	| { action: "edit"; prevData: Url; children: React.ReactElement };

export function EditCreateDialog({ children, action = "create", prevData }: EditCreateDialogProps) {
	const [openDialog, setOpenDialog] = useState(false);
	const { user } = useRouteContext({ from: "/(app)" });

	const createUrlMutation = useInsertUrl({ userId: user.id });
	const editUrlMutation = useEditUrlById({ userId: user.id });

	const form = useForm({
		...(action === "edit" && prevData
			? {
					defaultValues: {
						intermediaryScreen: prevData.intermediaryScreen,
						urlFull: prevData.urlFull,
						urlShort: prevData.urlShort,
					},
				}
			: fullFormOpts),
		validators: {
			onSubmit: ({ value }) => {
				const formattedValue: FullFormSchemaType = {
					...value,
					urlFull:
						value.urlFull.startsWith("http") || value.urlFull.startsWith("https")
							? value.urlFull
							: `https://${value.urlFull}`,
				};
				const parsed = fullFormSchemaServer.safeParse(formattedValue);
				if (!parsed.success) {
					const flattenedErrors = z.flattenError(parsed.error);
					return {
						fields: Object.fromEntries(
							Object.entries(flattenedErrors.fieldErrors).map(([key, errors]) => [
								key,
								errors.map((err) => ({ message: err })),
							]),
						),
					};
				}
				return undefined;
			},
		},
		onSubmit: async ({ value, formApi }) => {
			try {
				if (action === "edit" && prevData) {
					await editUrlMutation.mutateAsync({ data: { id: prevData.id, ...value } });
					toast.success("URL edited successfully!");
				} else {
					await createUrlMutation.mutateAsync({ data: value });
					toast.success("URL shortened successfully!");
				}
				setOpenDialog(false);
			} catch (error) {
				if (error instanceof DBError) {
					if (error.field) {
						formApi.setErrorMap({
							onSubmit: {
								fields: {
									[error.field]: { message: error.message },
								},
								form: { message: "Please fix the errors and try again." },
							},
						});
					}
				}
				toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
			}
		},
	});
	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogTrigger render={children} />
			<DialogContent>
				<form
					className="contents"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<DialogHeader>
						<DialogTitle>{action === "edit" ? "Edit URL" : "Create URL"}</DialogTitle>
						<DialogDescription>
							Fill in the details below to{" "}
							{action === "edit" ? "edit the URL" : "create a new shortened URL"}.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup className="flex flex-col gap-4">
						<form.Field name="urlFull">
							{(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Original URL</FieldLabel>
										<Input
											type="text"
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="https://example.com/very-long-url"
											autoComplete="off"
											className="bg-white"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						</form.Field>
						<form.Field name="urlShort">
							{(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Shorten URL</FieldLabel>
										<div className="flex flex-row items-center gap-2">
											<Input disabled value={env.VITE_SHORT_URL} />
											<Input
												type="text"
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="ABC"
												autoComplete="off"
												className="bg-white"
											/>
										</div>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						</form.Field>
						<form.Field name="intermediaryScreen">
							{(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<FieldLabel htmlFor={field.name}>
										<Field orientation="horizontal">
											<Checkbox
												id={field.name}
												name={field.name}
												checked={field.state.value}
												onBlur={field.handleBlur}
												onCheckedChange={(checked) => field.handleChange(checked === true)}
											/>
											<FieldContent>
												<FieldTitle>Intermediary Screen</FieldTitle>
												<FieldDescription>
													Show an intermediary screen before redirecting to the original URL.
												</FieldDescription>
											</FieldContent>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									</FieldLabel>
								);
							}}
						</form.Field>
					</FieldGroup>
					<DialogFooter>
						<Button type="submit" className="w-full">
							{action === "edit" ? "Update URL" : "Shorten URL"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
