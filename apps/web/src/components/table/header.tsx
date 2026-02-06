import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, EyeOff } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";

import type { Column, SortDirection } from "@tanstack/react-table";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	sorted: false | SortDirection;
	title: string;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	sorted,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	const sortable = column.getCanSort();
	const hideable = column.getCanHide();
	if (!sortable && !hideable) {
		return <div className={cn(className)}>{title}</div>;
	}
	return (
		<div className={cn("flex items-center gap-2 font-medium", className)}>
			{sortable || hideable ? (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
								<span>{title}</span>
								{sortable ? (
									sorted === "desc" ? (
										<ArrowDown />
									) : sorted === "asc" ? (
										<ArrowUp />
									) : (
										<ArrowUpDown />
									)
								) : (
									<ChevronDown />
								)}
							</Button>
						}
					/>
					<DropdownMenuContent align="start">
						{sortable && (
							<DropdownMenuGroup>
								<DropdownMenuLabel>Sort</DropdownMenuLabel>
								<DropdownMenuRadioGroup
									value={column.getIsSorted()}
									onValueChange={(value: SortDirection) => {
										if (value === "desc") {
											column.toggleSorting(true);
										} else {
											column.toggleSorting(false);
										}
									}}
								>
									<DropdownMenuRadioItem value={"asc"} closeOnClick>
										<ArrowUp />
										Asc
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value={"desc"} closeOnClick>
										<ArrowDown />
										Desc
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuGroup>
						)}
						{sortable && hideable && <DropdownMenuSeparator />}
						{hideable && (
							<DropdownMenuGroup>
								<DropdownMenuLabel>Visibility</DropdownMenuLabel>
								<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
									<EyeOff />
									Hide
								</DropdownMenuItem>
							</DropdownMenuGroup>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<>{title}</>
			)}
		</div>
	);
}
