import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { lastLoginMethod } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { passkey } from "@better-auth/passkey";

import { db } from "@/db";
import { env } from "@/env";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	account: {
		accountLinking: {
			enabled: true,
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
	},
	socialProviders: {
		google: {
			disableImplicitSignUp: true,
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
		github: {
			disableImplicitSignUp: true,
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
	},
	plugins: [lastLoginMethod(), passkey(), tanstackStartCookies()],
});
