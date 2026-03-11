import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { event } from "onedollarstats";

import { Alert, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Field, FieldDescription, FieldGroup, FieldSeparator } from "@repo/ui/components/field";

import Decorations from "@/assets/pattern.jpg";

import { getLastUsedLoginMethod } from "@/lib/auth/auth-client";
import { signInMethods } from "@/lib/auth/method";

export const Route = createFileRoute("/(auth)/signin")({
	component: RouteComponent,
});

function RouteComponent() {
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const lastUsedLoginMethod = getLastUsedLoginMethod();
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
									<FieldSeparator>Sign in with</FieldSeparator>
									<Field className="grid grid-cols-1 gap-2">
										{signInMethods.map((method) => {
											return (
												<Button
													key={method.id}
													variant="outline"
													type="button"
													className="relative py-2"
													onClick={async () => {
														const { error } = await method.onclick();
														if (error) {
															setErrorMessage(error.message);
														} else {
															event("signed_in", { method: method.id });
															toast.success("Successfully signed in!");
														}
													}}
												>
													{typeof method.logo === "string" ? (
														<Image
															src={method.logo}
															alt={`${method.name} Logo`}
															width={256}
															height={256}
															className="h-full w-auto"
														/>
													) : (
														<method.logo className="h-5 w-5" />
													)}
													<span>{method.name}</span>
													{method.id === lastUsedLoginMethod && (
														<Badge
															variant="secondary"
															className="absolute right-1.5 rounded-sm text-xs tracking-tight"
														>
															Last Used
														</Badge>
													)}
												</Button>
											);
										})}
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
