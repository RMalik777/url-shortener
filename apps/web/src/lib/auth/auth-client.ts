import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
	plugins: [lastLoginMethodClient(), passkeyClient()],
});

export const {
	signIn,
	signUp,
	signOut,
	useSession,
	passkey,
	getLastUsedLoginMethod,
	clearLastUsedLoginMethod,
} = authClient;
