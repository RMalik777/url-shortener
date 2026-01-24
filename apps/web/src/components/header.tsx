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

import type { User } from "@repo/db/schema";

import { signOut } from "@/lib/auth/auth-client";
import { navRoutes } from "@/lib/const/nav";
import { acronym } from "@/lib/functions/utils";

export function Header({ user }: Readonly<{ user: User }>) {
	const navigate = useNavigate();
	const [openDropdown, setOpenDropdown] = useState(false);
	const [openAlert, setOpenAlert] = useState(false);

	return (
		<>
			<header className="fixed bottom-0 m-4 flex h-fit w-[calc(100%-2rem)] items-center justify-between rounded-md border border-b bg-background/80 p-2 backdrop-blur-sm transition-all duration-200 ease-out sm:inset-0 sm:m-0 sm:w-full sm:rounded-none">
				<nav>
					<ul>
						{navRoutes.map((route) => (
							<li key={route.href}>
								<Link to={route.href}>{route.label}</Link>
							</li>
						))}
					</ul>
				</nav>

				<DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown} modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="h-fit w-fit px-2! py-1 transition duration-200 ease-out"
						>
							<Avatar className="size-6">
								<AvatarImage src={user.image ?? ""} alt="" />
								<AvatarFallback className="text-xs">{acronym(user.name)}</AvatarFallback>
							</Avatar>
							<span className="text-sm max-sm:hidden">{user.name}</span>
							<ChevronDown
								className={cn(openDropdown ? "rotate-180" : "", "transition duration-200 ease-out")}
							/>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to="/profile">Profile</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive" onClick={() => setOpenAlert(true)}>
							Sign Out
						</DropdownMenuItem>
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
