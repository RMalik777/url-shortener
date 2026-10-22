import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { event } from "onedollarstats";

import { account as accountTable, passkey as passkeyTable } from "@repo/db/schema";

import type { User } from "@repo/db/schema";

import { db } from "@/db";
import { linkSocial, passkey, unlinkAccount, updateUser } from "@/lib/auth/auth-client";
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
		mutationFn: async ({ accountId }: { accountId: string }) => await unlinkAccount({ accountId }),
		onSuccess: () => {
			event("Account Unlinked");
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
			event("Account Linked");
			queryClient.invalidateQueries({ queryKey: [userId, "profile", "linkedAccounts"] });
		},
	});
};

export const getPasskeysOptions = ({ userId }: { userId: User["id"] }) =>
	queryOptions({
		queryKey: [userId, "profile", "passkeys"],
		queryFn: async () => await getUserPasskeys(),
		staleTime: Infinity,
	});
const getUserPasskeys = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const passkeys = await db
			.select({
				id: passkeyTable.id,
				name: passkeyTable.name,
				deviceType: passkeyTable.deviceType,
				backedUp: passkeyTable.backedUp,
				createdAt: passkeyTable.createdAt,
			})
			.from(passkeyTable)
			.where(eq(passkeyTable.userId, context.id))
			.orderBy(desc(passkeyTable.createdAt));
		return passkeys;
	});

export const useAddPasskey = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ name }: { name?: string }) => await passkey.addPasskey({ name }),
		onSuccess: ({ error }) => {
			if (error) return;
			event("Passkey Added");
			queryClient.invalidateQueries({ queryKey: [userId, "profile", "passkeys"] });
		},
	});
};

export const useDeletePasskey = ({ userId }: { userId: User["id"] }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id }: { id: string }) => await passkey.deletePasskey({ id }),
		onSuccess: ({ error }) => {
			if (error) return;
			event("Passkey Deleted");
			queryClient.invalidateQueries({ queryKey: [userId, "profile", "passkeys"] });
		},
	});
};
