import { z } from "zod";
import { formOptions } from "@tanstack/react-form-start";
import { createInsertSchema } from "drizzle-zod";
import { urls } from "@repo/db/schema";

const baseSchema = createInsertSchema(urls).omit({
	id: true,
	isDeleted: true,
	deletedAt: true,
	createdAt: true,
	updatedAt: true,
	createdBy: true,
});

const urlValidation = z
	.url({
		protocol: /^https?$/,
		hostname: z.regexes.domain,
		error: "Invalid URL format",
	})
	.min(1, { error: "URL is too short" })
	.max(2048, { error: "URL is too long" })
	.transform((val) => val.trim().toLowerCase());

export const quickFormSchema = baseSchema.pick({ urlFull: true }).extend({
	urlFull: z
		.string()
		.min(1, { error: "URL is too short" })
		.max(2048, { error: "URL is too long" })
		.transform((val) => val.trim().toLocaleLowerCase()),
});
export const quickFormSchemaServer = quickFormSchema.extend({
	urlFull: urlValidation,
});
export const quickFormOpts = formOptions({
	defaultValues: {
		urlFull: "",
	} satisfies z.infer<typeof quickFormSchema>,
});

export const fullFormSchema = baseSchema.extend({
	urlFull: z
		.string()
		.min(1, { error: "URL is too short" })
		.max(2048, { error: "URL is too long" })
		.transform((val) => val.trim().toLocaleLowerCase()),
	urlShort: z
		.string()
		.min(1, { error: "Shorten URL is too short" })
		.max(50, { error: "Shorten URL is too long" }),
	intermediaryScreen: z.boolean(),
});
export const fullFormSchemaServer = fullFormSchema.extend({
	urlFull: urlValidation,
});
export const fullFormOpts = formOptions({
	defaultValues: {
		urlFull: "",
		urlShort: "",
		intermediaryScreen: false as boolean,
	} satisfies z.infer<typeof fullFormSchema>,
});

export type SmallFormSchema = z.infer<typeof quickFormSchema>;
export type SmallFormSchemaServer = z.infer<typeof quickFormSchemaServer>;
export type FullFormSchemaType = z.infer<typeof fullFormSchema>;
