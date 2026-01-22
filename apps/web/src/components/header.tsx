import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { ChevronDown } from "lucide-react";
import { useWindowScroll } from "@uidotdev/usehooks";

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
	const [openDropdown, setOpenDropdown] = useState(false);
	const [openAlert, setOpenAlert] = useState(false);
	const [window] = useWindowScroll();

	return (
		<>
			<header
				className={cn(
					"fixed inset-0 flex h-fit w-full items-center justify-between border-b bg-background/80 p-2 backdrop-blur-sm transition duration-200 ease-out",
					window.y !== null && window.y > 10
						? "shadow-xs"
						: "-translate-y-full shadow-none blur-xs",
				)}
			>
				<nav>
					<ul>
						{navRoutes.map((route) => (
							<li key={route.href}>
								<Link to={route.href}>{route.label}</Link>
							</li>
						))}
					</ul>
				</nav>

				<DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="default" className="h-fit w-fit px-2 py-1">
							<Avatar className="size-7">
								<AvatarImage src={user.image ?? ""} alt="" />
								<AvatarFallback className="text-xs">{acronym(user.name)}</AvatarFallback>
							</Avatar>
							<span className="text-sm">{user.name}</span>
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
						<AlertDialogAction onClick={() => signOut()}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
