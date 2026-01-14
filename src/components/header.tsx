import { Link } from "@tanstack/react-router";

import type { User } from "@/db/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { signOut } from "@/lib/auth/auth-client";
import { navRoutes } from "@/lib/const/nav";
import { acronym } from "@/lib/utils";

export function Header({ user }: Readonly<{ user: User }>) {
	return (
		<header className="fixed inset-0 flex h-fit w-full items-center justify-between bg-background p-2">
			<nav>
				<ul>
					{navRoutes.map((route) => (
						<li key={route.href}>
							<Link to={route.href}>{route.label}</Link>
						</li>
					))}
				</ul>
			</nav>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="default" className="h-fit px-3 py-1">
						<Avatar>
							<AvatarImage src={user.image ?? ""} alt="" />
							<AvatarFallback className="">{acronym(user.name)}</AvatarFallback>
						</Avatar>
						<span>{user.name}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link to="/profile">Profile</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" onClick={() => signOut()}>
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
