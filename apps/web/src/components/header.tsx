import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ChevronDown } from "lucide-react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

import { cn } from "@repo/ui/lib/utils";

import type { SessionUser } from "@/lib/services/session";

import { signOut } from "@/lib/auth/auth-client";
import { navRoutes } from "@/lib/const/nav";
import { acronym } from "@/lib/functions/utils";

export function Header({ user }: Readonly<{ user: SessionUser }>) {
	const navigate = useNavigate();
	const [openDropdown, setOpenDropdown] = useState(false);
	const [openAlert, setOpenAlert] = useState(false);

	return (
		<>
			<header className="fixed bottom-0 z-30 m-4 flex h-fit w-[calc(100%-2rem)] items-center justify-between rounded-md bg-background/80 p-2 backdrop-blur-sm transition-all duration-200 ease-out max-sm:border sm:top-0 sm:right-0 sm:bottom-auto sm:left-0 sm:m-0 sm:w-full sm:rounded-none sm:border-b sm:px-4 lg:px-8">
				<nav>
					<ul className="flex items-center gap-2 text-sm font-medium">
						{navRoutes.map((route) => (
							<li key={route.href}>
								<Link
									to={route.href}
									// Without exact, "/" also matches "/list" and both items read as active.
									activeOptions={{ exact: route.href === "/" }}
									activeProps={{
										className: "bg-foreground text-background",
										"aria-current": "page",
									}}
									className="px-2 py-1 duration-200 ease-out hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								>
									{route.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown} modal={false}>
					<DropdownMenuTrigger
						render={
							<Button
								variant="outline"
								size="sm"
								className="h-fit w-fit px-2 py-2 transition duration-200 ease-out"
							>
								<Avatar className="size-6">
									<AvatarImage src={user.image ?? ""} alt="" />
									<AvatarFallback className="text-xs">{acronym(user.name)}</AvatarFallback>
								</Avatar>
								<span className="text-sm max-sm:hidden">{user.name}</span>
								<ChevronDown
									className={cn(
										openDropdown ? "rotate-180" : "",
										"transition duration-200 ease-out",
									)}
								/>
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						<DropdownMenuGroup>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuGroup>
								<DropdownMenuItem render={<Link to="/profile">Profile</Link>} />
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onClick={() => setOpenAlert(true)}>
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</header>

			<AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
						<AlertDialogDescription>
							You will be signed out of your account and will need to sign in again to access your
							data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenAlert(false)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								signOut({
									fetchOptions: {
										onSuccess: () => {
											navigate({ to: "/signin" });
										},
									},
								})
							}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
