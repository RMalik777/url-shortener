import { z } from "zod";
import { formOptions } from "@tanstack/react-form-start";

export const formSchema = z.object({
	url: z
		.string()
		.min(1, { error: "URL is too short" })
		.max(2048, { error: "URL is too long" })
		.transform((val) => val.trim().toLocaleLowerCase()),
});
export const formSchemaServer = formSchema.extend({
	url: z.url({ message: "Invalid URL format" }),
});
export const formOpts = formOptions({
	defaultValues: {
		url: "",
	},
});

export type FormSchema = z.infer<typeof formSchema>;
export type FormSchemaServer = z.infer<typeof formSchemaServer>;
