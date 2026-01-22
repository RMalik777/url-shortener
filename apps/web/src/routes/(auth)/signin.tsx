import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AlertOctagon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Field, FieldDescription, FieldGroup, FieldSeparator } from "@repo/ui/components/field";

import G from "@/assets/g_logo.svg";
import GH from "@/assets/github-mark.svg";
import Decorations from "@/assets/pattern.jpg";

import { signIn } from "@/lib/auth/auth-client";

export const Route = createFileRoute("/(auth)/signin")({
	component: RouteComponent,
});

function RouteComponent() {
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	return (
		<div className="flex h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<div className="flex flex-col gap-6">
					<Card className="overflow-hidden p-0">
						<CardContent className="grid p-0 md:grid-cols-2">
							<div className="p-6 md:p-8">
								<FieldGroup className="gap-4">
									<div className="flex flex-col items-center gap-2 text-center">
										<h1 className="text-2xl font-bold">Welcome back</h1>
										<p className="text-balance text-muted-foreground">
											Login to your Acme Inc account
										</p>
									</div>
									{errorMessage && (
										<>
											<Alert variant="destructive" hidden={false}>
												<AlertOctagon />
												<AlertTitle>{errorMessage}</AlertTitle>
											</Alert>
											<FieldSeparator />
										</>
									)}
									<Field className="grid grid-cols-1 gap-2">
										<Button
											variant="outline"
											type="button"
											onClick={async () => {
												const { error } = await signIn.social({
													provider: "google",
												});
												if (error) {
													setErrorMessage(error.message);
												} else {
													toast.success("Successfully signed in!");
												}
											}}
										>
											<Image
												src={G}
												alt="Google Logo"
												width={256}
												height={256}
												className="h-full w-auto"
											/>
											<span className="">Sign In with Google</span>
										</Button>
										<Button
											variant="outline"
											type="button"
											onClick={async () => {
												const { error } = await signIn.social({
													provider: "github",
												});
												if (error) {
													setErrorMessage(error.message);
												} else {
													toast.success("Successfully signed in!");
												}
											}}
										>
											<Image
												src={GH}
												alt="Github Logo"
												width={256}
												height={256}
												className="h-full w-auto"
											/>
											<span className="">Sign In with Github</span>
										</Button>
									</Field>
								</FieldGroup>
							</div>
							<div className="relative hidden bg-muted md:block">
								<Image
									src={Decorations}
									width={2000}
									height={2000}
									alt=""
									className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
								/>
							</div>
						</CardContent>
					</Card>
					<FieldDescription className="px-6 text-center">
						By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
						<a href="#">Privacy Policy</a>.
					</FieldDescription>
				</div>
			</div>
		</div>
	);
}
