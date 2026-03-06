import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { User } from "@repo/db/schema";
import { getAllUrls, getUrlsById } from "@/lib/functions/db";

export const urlQueryAll = ({
	userId,
	page,
	limit,
}: {
	userId: User["id"];
	page: number;
	limit: number;
}) =>
	queryOptions({
		queryKey: [userId, "urls", "all", limit, page],
		queryFn: async () => await getAllUrls({ data: { page, limit } }),
		staleTime: Infinity,
		placeholderData: keepPreviousData,
	});

export const urlQueryById = ({ id, userId }: { id: string; userId: User["id"] }) =>
	queryOptions({
		queryKey: [userId, "urls", id],
		queryFn: async () => await getUrlsById({ data: { id } }),
		staleTime: Infinity,
	});
