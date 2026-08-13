import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

import { generateRandomString } from "@/lib/functions/generator";
import { withProtocol } from "@/lib/functions/url";
import { getAllUrlsOptions, useInsertUrl } from "@/lib/query/url";
import { quickFormOpts, quickFormSchema, quickFormSchemaServer } from "@/lib/schema/url";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/table/data-table";
import { urlColumn } from "@/lib/data/table/url";

export const Route = createFileRoute("/(app)/(pages)/")({
	head: () => ({
		title: "URL Shortener",
		meta: [
			{ title: "URL Shortener" },
			{
				name: "description",
				content: "Manage and shorten your URLs with ease.",
			},
		],
	}),
	component: App,
});

function App() {
	const { user } = Route.useRouteContext();
	const { data: urls } = useSuspenseQuery(getAllUrlsOptions({ userId: user.id }));
	const insertUrlMutation = useInsertUrl({ userId: user.id });

	const form = useForm({
		...quickFormOpts,
		validators: {
			onBlur: quickFormSchema,
			onSubmit: ({ value }) => {
				// Validate the URL the server will actually store, protocol included.
				const parsed = quickFormSchemaServer.safeParse({ urlFull: withProtocol(value.urlFull) });
				if (parsed.success) {
					return undefined;
				}
				const flattenedErrors = z.flattenError(parsed.error);
				return {
					fields: Object.fromEntries(
						Object.entries(flattenedErrors.fieldErrors).map(([key, errors]) => [
							key,
							errors.map((err) => ({ message: err })),
						]),
					),
				};
			},
		},
		onSubmit: async ({ value }) => {
			try {
				const response = await insertUrlMutation.mutateAsync({
					data: {
						urlFull: withProtocol(value.urlFull),
						urlShort: generateRandomString(6),
						intermediaryScreen: false,
						// Let the server retry on the (rare) generated-code collision.
						autoShortCode: true,
					},
				});
				form.reset();
				try {
					await navigator.clipboard.writeText(response.shortenedUrl);
					toast.success(`Shortened to ${response.shortenedUrl} and copied to clipboard`);
				} catch {
					toast.success(`Shortened to ${response.shortenedUrl}`);
				}
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Could not shorten that URL. Please try again.",
				);
			}
		},
	});

	return (
		<div className="flex flex-col gap-8">
			<PageHeader title="Shorten a URL" description="Paste a long link and get a short one back." />

			<Card>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="contents"
				>
					<CardContent>
						<FieldGroup>
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
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="justify-end">
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" disabled={isSubmitting}>
									Shorten URL
								</Button>
							)}
						</form.Subscribe>
					</CardFooter>
				</form>
			</Card>

			<section className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-2">
					<h2 className="text-lg font-semibold tracking-tight">Recent links</h2>
					<Button
						variant="link"
						nativeButton={false}
						render={
							<Link to="/list">
								See all <ArrowRightIcon />
							</Link>
						}
					/>
				</div>
				<DataTable
					columns={urlColumn}
					data={urls}
					initialPageSize={5}
					searchPlaceholder="Search links"
				/>
			</section>
		</div>
	);
}
