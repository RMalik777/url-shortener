import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { event } from "onedollarstats";

import { urls } from "@repo/db/schema";

import type { Url, User } from "@repo/db/schema";

import { env } from "@/env";
import { db } from "@/db";
import { generateRandomString } from "@/lib/functions/generator";
import { withProtocol } from "@/lib/functions/url";
import { authMiddleware } from "@/lib/middleware/auth";
import { editUrlSchema, insertUrlSchema } from "@/lib/schema/url";
import { DBError } from "@/lib/types/error";

/**
 * Restores the honest return type of drizzle's `.get()`.
 *
 * drizzle types `.get()` as non-nullable, but the D1 driver returns `undefined` when
 * the statement matches no rows (`d1/session.js`: `if (!rows[0]) return void 0`). Without
 * this the `!row` guards below destructure `undefined` and throw a `TypeError` — which is
 * exactly what happened when soft-deleting an already-deleted URL.
 */
function firstRow<T>(row: T): T | undefined {
	return row;
}

/** SQLite surfaces short-code collisions as a UNIQUE constraint violation on `url_short`. */
function isShortCodeConflict(error: unknown) {
	return error instanceof Error && error.message.includes("urls.url_short");
}

/**
 * Wraps an unexpected failure as a 500. Deliberate `DBError`s thrown inside a `try`
 * are re-thrown untouched — otherwise a considered 404 gets rewritten as a generic 500.
 */
function asDBError(error: unknown, location: string) {
	if (error instanceof DBError) {
		return error;
	}
	return new DBError(error instanceof Error ? error.message : "Unknown error", {
		location,
		cause: error,
		statusCode: 500,
	});
}

export const getAllUrlsOptions = ({ userId }: { userId: User["id"] }) =>
	queryOptions({
		queryKey: [userId, "urls", "all"],
		queryFn: async () => await getAllUrls(),
		staleTime: Infinity,
	});
const getAllUrls = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			return await db
				.select()
				.from(urls)
				.where(eq(urls.createdBy, context.id))
				.orderBy(desc(urls.createdAt));
		} catch (error) {
			throw asDBError(error, "getAllUrls");
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
			return response ?? null;
		} catch (error) {
			throw asDBError(error, "getUrlById");
		}
	});

export const useInsertUrl = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: insertUrl,
		onSuccess: ({ urlId, urlShort, urlLong }) => {
			event("Url Created", {
				url_id: urlId,
				short_url: urlShort,
				full_url: urlLong,
			});
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
		},
	});
};

/** Attempts allowed when the caller lets the server pick the short code. */
const SHORT_CODE_ATTEMPTS = 5;

const insertUrl = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: unknown) => insertUrlSchema.parse(input))
	.handler(async ({ context, data }) => {
		const urlFull = withProtocol(data.urlFull);
		const attempts = data.autoShortCode ? SHORT_CODE_ATTEMPTS : 1;
		let urlShort = data.urlShort;

		for (let attempt = 0; attempt < attempts; attempt++) {
			try {
				const inserted = firstRow(
					await db
						.insert(urls)
						.values({
							urlFull,
							urlShort,
							intermediaryScreen: data.intermediaryScreen,
							createdBy: context.id,
						})
						.returning({ urlId: urls.id, urlShort: urls.urlShort, urlLong: urls.urlFull })
						.get(),
				);
				if (!inserted) {
					throw new DBError("Could not save the URL. Please try again.", {
						location: "insertUrl",
						statusCode: 500,
					});
				}
				return {
					shortenedUrl: env.VITE_SHORT_URL + inserted.urlShort,
					urlId: inserted.urlId,
					urlShort: inserted.urlShort,
					urlLong: inserted.urlLong,
				};
			} catch (error) {
				if (error instanceof DBError) {
					throw error;
				}
				if (!isShortCodeConflict(error)) {
					throw asDBError(error, "insertUrl");
				}
				// A caller-supplied code that collides is a user error, not something to retry.
				if (!data.autoShortCode) {
					throw new DBError("That short code is already in use.", {
						location: "insertUrl",
						field: "urlShort",
						cause: error,
						statusCode: 409,
					});
				}
				urlShort = generateRandomString(6);
			}
		}

		throw new DBError("Could not generate an unused short code. Please try again.", {
			location: "insertUrl",
			field: "urlShort",
			statusCode: 409,
		});
	});

export const useEditUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: editUrlById,
		onSuccess: ({ urlId, shortUrl, fullUrl }) => {
			event("Url Edited", {
				url_id: urlId,
				short_url: shortUrl,
				full_url: fullUrl,
			});
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
			queryClient.invalidateQueries({ queryKey: [userId, "urls", urlId] });
		},
	});
};
const editUrlById = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => editUrlSchema.parse(data))
	.handler(async ({ data, context }) => {
		const { id } = data;
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
			// Only the editable columns are written, so createdBy/isDeleted/timestamps stay
			// server-owned. Re-scoping the WHERE closes the gap between the check above and
			// this write.
			const updated = firstRow(
				await db
					.update(urls)
					.set({
						urlFull: withProtocol(data.urlFull),
						urlShort: data.urlShort,
						intermediaryScreen: data.intermediaryScreen,
					})
					.where(and(eq(urls.id, id), eq(urls.createdBy, context.id), eq(urls.isDeleted, false)))
					.returning({ urlId: urls.id, shortUrl: urls.urlShort, fullUrl: urls.urlFull })
					.get(),
			);
			if (!updated) {
				throw new DBError("URL not found", {
					location: "id",
					statusCode: 404,
				});
			}
			return updated;
		} catch (error) {
			if (isShortCodeConflict(error)) {
				throw new DBError("That short code is already in use.", {
					location: "editUrlById",
					field: "urlShort",
					cause: error,
					statusCode: 409,
				});
			}
			throw asDBError(error, "editUrlById");
		}
	});

export const useDeleteUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteUrlbyId,
		onSuccess: ({ urlId, shortUrl, fullUrl }) => {
			event("Url Deleted", {
				delete: "soft",
				url_id: urlId,
				full_url: fullUrl,
				short_url: shortUrl,
			});
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
		if (toBeDeleted.isDeleted) {
			throw new DBError("This URL is already deleted", {
				location: "id",
				statusCode: 409,
			});
		}
		try {
			const deleted = firstRow(
				await db
					.update(urls)
					.set({ isDeleted: true, deletedAt: new Date() })
					.where(and(eq(urls.id, data), eq(urls.createdBy, context.id), eq(urls.isDeleted, false)))
					.returning({ urlId: urls.id, shortUrl: urls.urlShort, fullUrl: urls.urlFull })
					.get(),
			);
			if (!deleted) {
				throw new DBError("URL not found", {
					location: "id",
					statusCode: 404,
				});
			}
			return deleted;
		} catch (error) {
			throw asDBError(error, "deleteUrlbyId");
		}
	});

export const useRestoreUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: restoreUrlById,
		onSuccess: ({ urlId, fullUrl, shortUrl }) => {
			event("Url Restored", {
				url_id: urlId,
				full_url: fullUrl,
				short_url: shortUrl,
			});
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
			queryClient.invalidateQueries({ queryKey: [userId, "urls", urlId] });
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
			const restored = firstRow(
				await db
					.update(urls)
					.set({ isDeleted: false, deletedAt: null })
					.where(and(eq(urls.id, data), eq(urls.createdBy, context.id), eq(urls.isDeleted, true)))
					.returning({ urlId: urls.id, shortUrl: urls.urlShort, fullUrl: urls.urlFull })
					.get(),
			);
			if (!restored) {
				throw new DBError("URL not found", {
					location: "id",
					statusCode: 404,
				});
			}
			return restored;
		} catch (error) {
			throw asDBError(error, "restoreUrlById");
		}
	});

export const useHardDeleteUrlById = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: hardDeleteUrlById,
		onSuccess: ({ urlId, shortUrl, fullUrl }) => {
			event("Url Deleted", {
				delete: "hard",
				url_id: urlId,
				full_url: fullUrl,
				short_url: shortUrl,
			});
			queryClient.invalidateQueries({ queryKey: [userId, "urls", "all"] });
			queryClient.invalidateQueries({ queryKey: [userId, "urls", urlId] });
		},
	});
};
const hardDeleteUrlById = createServerFn({ method: "POST" })
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
			const deleted = firstRow(
				await db
					.delete(urls)
					.where(and(eq(urls.id, data), eq(urls.createdBy, context.id)))
					.returning({ urlId: urls.id, shortUrl: urls.urlShort, fullUrl: urls.urlFull })
					.get(),
			);
			if (!deleted) {
				throw new DBError("URL not found", {
					location: "id",
					statusCode: 404,
				});
			}
			return deleted;
		} catch (error) {
			throw asDBError(error, "hardDeleteUrlById");
		}
	});
