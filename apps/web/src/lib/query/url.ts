import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, count, eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";

import { urls } from "@repo/db/schema";

import type { FullFormSchemaType } from "@/lib/schema/url";
import type { Url, User } from "@repo/db/schema";
import type { z } from "zod";

import { env } from "@/env";
import { db } from "@/db";
import { authMiddleware } from "@/lib/middleware/auth";
import { DBError } from "@/lib/types/error";

export const getAllUrlsOptions = ({
	userId,
	page,
	limit,
}: {
	userId: User["id"];
	page?: number;
	limit?: number;
}) =>
	queryOptions({
		queryKey: [userId, "urls", "all", limit, page],
		queryFn: async () => await getAllUrls({ data: { page, limit } }),
		staleTime: Infinity,
		placeholderData: keepPreviousData,
	});
const getAllUrls = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: { page?: number; limit?: number }) => data)
	.handler(async ({ context, data }) => {
		try {
			const baseQuery = db.select().from(urls).where(eq(urls.createdBy, context.id));
			const [rows, total] = await Promise.all([
				typeof data.limit === "number" && typeof data.page === "number"
					? baseQuery.limit(data.limit).offset(data.page * data.limit)
					: baseQuery,
				db.select({ total: count() }).from(urls).where(eq(urls.createdBy, context.id)).get(),
			]);
			if (total) {
				return { rows, total: total.total };
			}
		} catch (error) {
			throw new DBError(error instanceof Error ? error.message : "Unknown error", {
				location: "getAllUrls",
				cause: error,
				statusCode: 500,
			});
		}
	});

export const getUrlByIdOptions = ({ id, userId }: { id: string; userId: User["id"] }) =>
	queryOptions({
		queryKey: [userId, "urls", id],
		queryFn: async () => await getUrlById({ data: { id } }),
		staleTime: Infinity,
	});
const getUrlById = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: { id: Url["id"] }) => {
		return { ...data };
	})
	.handler(async ({ data, context }) => {
		try {
			const response = await db
				.select()
				.from(urls)
				.where(and(eq(urls.id, data.id), eq(urls.createdBy, context.id)))
				.get();
			return response;
		} catch (error) {
			throw new DBError(error instanceof Error ? error.message : "Unknown error", {
				location: "getUrlsById",
				cause: error,
				statusCode: 500,
			});
		}
	});

export const useInsertUrl = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: insertUrl,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
		},
	});
};
const insertUrl = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: FullFormSchemaType) => input)
	.handler(async ({ context, data }) => {
		const isDuplicate = await db.select().from(urls).where(eq(urls.urlShort, data.urlShort)).get();
		if (isDuplicate) {
			throw new DBError("Custom short code already in use", {
				location: "insertUrlWithCode",
				field: "urlShort",
				statusCode: 400,
			});
		}
		const parsedUrl =
			data.urlFull.startsWith("http") || data.urlFull.startsWith("https")
				? data.urlFull
				: `https://${data.urlFull}`;
		try {
			const { urlShort } = await db
				.insert(urls)
				.values({
					urlFull: parsedUrl,
					urlShort: data.urlShort,
					intermediaryScreen: data.intermediaryScreen,
					createdBy: context.id,
				})
				.returning({ urlShort: urls.urlShort })
				.get();
			return {
				shortenedUrl: env.VITE_SHORT_URL + urlShort,
			};
		} catch (error) {
			throw new DBError(error instanceof Error ? error.message : "Unknown error", {
				location: "insertUrlWithCode",
				cause: error,
				statusCode: 500,
			});
		}
	});

export const useEditUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: editUrlById,
		onSuccess: ({ urlId }) => {
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
			queryClient.invalidateQueries({ queryKey: [userId, "urls", urlId] });
		},
	});
};
const updateUrlSchema = createUpdateSchema(urls);
type UpdateUrlData = z.infer<typeof updateUrlSchema>;
const editUrlById = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data: UpdateUrlData) => data)
	.handler(async ({ data, context }) => {
		if (!data.id) {
			throw new DBError("ID is required", {
				location: "id",
				statusCode: 400,
			});
		}
		const { id, ...updateData } = data;
		const toBeUpdated = await db.select().from(urls).where(eq(urls.id, id)).get();
		if (!toBeUpdated || toBeUpdated.createdBy !== context.id) {
			throw new DBError("URL not found", {
				location: "id",
				statusCode: 404,
			});
		}
		if (toBeUpdated.isDeleted) {
			throw new DBError("Cannot update a deleted URL", {
				location: "id",
				statusCode: 400,
			});
		}
		try {
			const { urlId } = await db
				.update(urls)
				.set({ ...updateData })
				.where(and(eq(urls.id, id)))
				.returning({ urlId: urls.id })
				.get();
			return { urlId };
		} catch (error) {
			throw new DBError(error instanceof Error ? error.message : "Unknown error", {
				location: "editUrlById",
				cause: error,
				statusCode: 500,
			});
		}
	});

export const useDeleteUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteUrlbyId,
		onSuccess: ({ urlId }) => {
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
			queryClient.invalidateQueries({ queryKey: [userId, "urls", urlId] });
		},
	});
};
const deleteUrlbyId = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((urlId: Url["id"]) => urlId)
	.handler(async ({ data, context }) => {
		if (!data) {
			throw new DBError("URL ID is required", {
				location: "id",
				statusCode: 400,
			});
		}
		const toBeDeleted = await db.select().from(urls).where(eq(urls.id, data)).get();
		if (!toBeDeleted || toBeDeleted.createdBy !== context.id) {
			throw new DBError("URL not found", {
				location: "id",
				statusCode: 404,
			});
		}
		try {
			const { urlId } = await db
				.update(urls)
				.set({ isDeleted: true, deletedAt: new Date() })
				.where(and(eq(urls.id, data), eq(urls.isDeleted, false)))
				.returning({ urlId: urls.id })
				.get();
			return { urlId };
		} catch (error) {
			throw new DBError(error instanceof Error ? error.message : "Unknown error", {
				location: "deleteUrlbyId",
				cause: error,
				statusCode: 500,
			});
		}
	});

export const useRestoreUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: restoreUrlById,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
		},
	});
};
const restoreUrlById = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((urlId: Url["id"]) => urlId)
	.handler(async ({ data, context }) => {
		if (!data) {
			throw new DBError("URL ID is required", {
				location: "id",
				statusCode: 400,
			});
		}
		const toBeRestored = await db.select().from(urls).where(eq(urls.id, data)).get();
		if (!toBeRestored || toBeRestored.createdBy !== context.id) {
			throw new DBError("URL not found", {
				location: "id",
				statusCode: 404,
			});
		}
		if (!toBeRestored.isDeleted) {
			throw new DBError("URL is not deleted", {
				location: "id",
				statusCode: 400,
			});
		}
		try {
			await db.update(urls).set({ isDeleted: false, deletedAt: null }).where(eq(urls.id, data));
		} catch (error) {
			throw new DBError(error instanceof Error ? error.message : "Unknown error", {
				location: "restoreUrlById",
				cause: error,
				statusCode: 500,
			});
		}
	});

export const useHardDeleteUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: hardDeleteUrlById,
		onSuccess: ({ urlId }) => {
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
			queryClient.invalidateQueries({ queryKey: [userId, "urls", urlId] });
		},
	});
};
const hardDeleteUrlById = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((urlId: Url["id"]) => urlId)
	.handler(async ({ data }) => {
		if (!data) {
			throw new DBError("URL ID is required", {
				location: "id",
				statusCode: 400,
			});
		}
		const toBeDeleted = await db.select().from(urls).where(eq(urls.id, data)).get();
		if (!toBeDeleted) {
			throw new DBError("URL not found", {
				location: "id",
				statusCode: 404,
			});
		}
		try {
			const deleted = await db
				.delete(urls)
				.where(eq(urls.id, data))
				.returning({ urlId: urls.id })
				.get();
			return { urlId: deleted?.urlId };
		} catch (error) {
			throw new DBError(error instanceof Error ? error.message : "Unknown error", {
				location: "hardDeleteUrlById",
				cause: error,
				statusCode: 500,
			});
		}
	});
