import { useForm } from "@tanstack/react-form-start";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";

import type { FormSchemaServer } from "@/lib/schema/url";
import { formOpts, formSchema, formSchemaServer } from "@/lib/schema/url";
import { db } from "@/db";
import { urls } from "@/db/schema";
import { env } from "@/env";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { generateRandomString } from "@/lib/functions/generator";
import { authMiddleware } from "@/lib/middleware/auth";

export const Route = createFileRoute("/(app)/")({
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

const handleForm = createServerFn({ method: "POST" })
	.inputValidator((data: FormSchemaServer) => data)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		const randomString = generateRandomString(6);
		let formattedUrl = data.url;
		if (!(data.url.startsWith("https") || data.url.startsWith("http"))) {
			formattedUrl = `https://${data.url}`;
		}
		await db.insert(urls).values({
			urlFull: formattedUrl,
			urlShort: randomString,
			createdBy: context.id,
		});
		return {
			shortenedUrl: env.VITE_SHORT_URL + randomString,
		};
	});

function App() {
	const mutation = useMutation({
		mutationFn: handleForm,
	});
	const form = useForm({
		...formOpts,
		validators: {
			onBlur: formSchema,
			onSubmit: ({ value }) => {
				if (value.url.startsWith("https") || value.url.startsWith("http")) {
					return undefined;
				}
				const formatted = `http://${value.url}`;
				const parsed = formSchemaServer.safeParse(formatted);
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
			console.log("Submitting form with value:", value);
			try {
				const response = await mutation.mutateAsync({ data: value });
				console.log("Server response:", response);
			} catch (error) {
				console.error("Error submitting form:", error);
			}
		},
	});

	return (
		<>
			<section className="flex h-svh flex-col items-center justify-center p-6">
				<div className="w-full max-w-md space-y-8">
					<div className="space-y-2 text-center">
						<h1 className="font-display text-xl font-bold text-slate-900">URL Shortener</h1>
						<p className="text-lg text-slate-600">Enter a URL to shorten it.</p>
					</div>
					<Card>
						<CardContent>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									form.handleSubmit();
								}}
								className="contents"
							>
								<FieldGroup className="flex flex-col gap-4">
									<form.Field name="url">
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
									<Field>
										<Button type="submit" className="w-full">
											Shorten URL
										</Button>
									</Field>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</div>
			</section>
			<section className="h-dvh"></section>
		</>
	);
}
