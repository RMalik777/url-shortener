import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "@/db";
import { env } from "@/env";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
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
	plugins: [tanstackStartCookies()], // make sure this is the last plugin in the array
});
