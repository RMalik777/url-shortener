import { useForm } from "@tanstack/react-form-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRightSquare } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";

import { generateRandomString } from "@/lib/functions/generator";
import { getAllUrlsOptions, useInsertUrl } from "@/lib/query/url";
import { quickFormOpts, quickFormSchema, quickFormSchemaServer } from "@/lib/schema/url";

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
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(5);
	const [, startTransition] = useTransition();

	const { data: urlList } = useSuspenseQuery(getAllUrlsOptions({ userId: user.id, page, limit }));
	const insertUrlMutation = useInsertUrl({ userId: user.id });

	const form = useForm({
		...quickFormOpts,
		validators: {
			onBlur: quickFormSchema,
			onSubmit: ({ value }) => {
				if (value.urlFull.startsWith("https") || value.urlFull.startsWith("http")) {
					return undefined;
				}
				const formatted = `http://${value.urlFull}`;
				const parsed = quickFormSchemaServer.safeParse(formatted);
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
		onSubmit: async ({ value }) => {
			const randomString = generateRandomString(6);
			let formattedUrl = value.urlFull;
			if (!(value.urlFull.startsWith("https") || value.urlFull.startsWith("http"))) {
				formattedUrl = `https://${value.urlFull}`;
			}
			const data = {
				urlFull: formattedUrl,
				urlShort: randomString,
				intermediaryScreen: false,
			};
			try {
				const response = await insertUrlMutation.mutateAsync({ data: data });
				form.reset();
				navigator.clipboard.writeText(response.shortenedUrl);
				toast.success(`URL shortened to ${response.shortenedUrl} and copied to clipboard!`);
			} catch (error) {
				console.error("Error submitting form:", error);
			}
		},
	});

	const pageCount = urlList ? Math.ceil(urlList.total / limit) : 0;

	return (
		<>
			<section className="flex h-svh flex-col items-center justify-center p-6">
				<div className="w-full max-w-md space-y-8">
					<div className="space-y-2 text-center">
						<h1 className="font-display text-xl font-bold text-slate-900">URL Shortener</h1>
						<p className="text-lg text-slate-600">Enter a URL to shorten it.</p>
					</div>
					<Card>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="contents"
						>
							<CardContent>
								<FieldGroup className="flex flex-col gap-4">
									<form.Field name="urlFull">
										{(field) => {
											const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel
														htmlFor={field.name}
														className="mb-2 block text-sm font-medium text-slate-700"
													>
														Original URL
													</FieldLabel>
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
								</FieldGroup>
							</CardContent>
							<CardFooter className="flex-col gap-2">
								<Button type="submit" className="w-full">
									Shorten URL
								</Button>
							</CardFooter>
						</form>
					</Card>
				</div>
			</section>
			<Separator orientation="horizontal" />
			<section className="py-4">
				<div className="flex flex-row justify-between">
					<h2 className="text-4xl font-medium">Shortened URLs</h2>
					<Button
						variant="link"
						nativeButton={false}
						render={
							<Link to="/list">
								See All <ArrowRightSquare />
							</Link>
						}
					/>
				</div>
				<DataTable
					columns={urlColumn}
					data={urlList?.rows ?? []}
					dataCount={urlList?.total ?? 0}
					pageIndex={page}
					pageSize={limit}
					pageCount={pageCount}
					onPageChange={(newPage) => startTransition(() => setPage(newPage))}
					onPageSizeChange={(newSize) => startTransition(() => setLimit(newSize))}
				/>
			</section>
		</>
	);
}
