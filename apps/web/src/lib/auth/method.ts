import { FingerprintPattern } from "lucide-react";
import G from "@/assets/g_logo.svg";
import Github from "@/assets/github-mark.svg";

import { signIn } from "@/lib/auth/auth-client";

export const signInMethods = [
	{
		id: "google",
		name: "Google",
		logo: G,
		onclick: async () => await signIn.social({ provider: "google" }),
	},
	{
		id: "github",
		name: "GitHub",
		logo: Github,
		onclick: async () => await signIn.social({ provider: "github" }),
	},
	{
		id: "passkey",
		name: "Passkey",
		logo: FingerprintPattern,
		onclick: async () =>
			await signIn.passkey({
				autoFill: true,
			}),
	},
];
