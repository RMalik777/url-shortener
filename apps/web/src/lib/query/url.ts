import { queryOptions } from "@tanstack/react-query";

import type { User } from "@repo/db/schema";
import { getAllUrls, getUrlsById } from "@/lib/functions/db";

export const urlQueryAll = ({ userId }: { userId: User["id"] }) =>
	queryOptions({
		queryKey: [userId, "urls", "all"],
		queryFn: async () => await getAllUrls(),
		staleTime: Infinity,
	});

export const urlQueryById = ({ id, userId }: { id: string; userId: User["id"] }) =>
	queryOptions({
		queryKey: [userId, "urls", id],
		queryFn: async () => await getUrlsById({ data: { id } }),
		staleTime: Infinity,
	});
