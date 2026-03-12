import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { eq, getTableColumns } from "drizzle-orm";
import { queryOptions } from "@tanstack/react-query";

import { urls } from "@repo/db/schema";
import { db } from "@/lib/db";

const schema = z.object({
	code: z.string().min(1),
});
export const useUrlData = ({ code }: { code: string }) => {
	return queryOptions({
		queryKey: ["url", code],
		queryFn: async () => await fetchData({ data: code }),
		staleTime: 1000 * 60 * 60, // 1 hour
	});
};
const fetchData = createServerFn({ method: "GET" })
	.inputValidator((data: string) => {
		return schema.parse({ code: data });
	})
	.handler(async ({ data }) => {
		const { id, urlFull, urlShort, isDeleted, intermediaryScreen } = getTableColumns(urls);
		try {
			const result = await db
				.select({ id, urlFull, urlShort, isDeleted, intermediaryScreen })
				.from(urls)
				.where(eq(urls.urlShort, data.code))
				.get();
			return result ?? null;
		} catch (error) {
			throw new Error("Failed to fetch URL data");
		}
	});
