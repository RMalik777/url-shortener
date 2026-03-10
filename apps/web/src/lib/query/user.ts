import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { account as accountTable } from "@repo/db/schema";

import type { User } from "@repo/db/schema";

import { db } from "@/db";
import { linkSocial, unlinkAccount, updateUser } from "@/lib/auth/auth-client";
import { authMiddleware } from "@/lib/middleware/auth";

export const useUpdateUserName = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (name: string) => updateUser({ name: name }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [userId, "profile"] });
		},
	});
};
export const getLinkedAccountsOptions = ({ userId }: { userId: User["id"] }) =>
	queryOptions({
		queryKey: [userId, "profile", "linkedAccounts"],
		queryFn: async () => await getUserLinkedAccounts(),
		staleTime: Infinity,
	});
const getUserLinkedAccounts = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const accounts = await db
			.select({
				id: accountTable.id,
				providerId: accountTable.providerId,
				accountId: accountTable.accountId,
			})
			.from(accountTable)
			.where(eq(accountTable.userId, context.id));
		return accounts;
	});

export const useUnlinkAccount = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ provider }: { provider: string }) =>
			await unlinkAccount({ providerId: provider }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [userId, "profile", "linkedAccounts"] });
		},
	});
};

export const useLinkAccount = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ provider }: { provider: string }) =>
			await linkSocial({ provider, callbackURL: "/profile" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [userId, "profile", "linkedAccounts"] });
		},
	});
};
