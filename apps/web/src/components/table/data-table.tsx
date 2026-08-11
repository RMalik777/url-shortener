import { flexRender, useTable } from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	Settings2Icon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";

import type {
	ColumnDef,
	ColumnVisibilityState,
	PaginationState,
	RowData,
	SortingState,
} from "@tanstack/react-table";

import { features } from "@/lib/data/table/features";

const PAGE_SIZES = [5, 10, 20, 25, 30, 40, 50];

interface DataTableProps<TData extends RowData> {
	columns: Array<ColumnDef<typeof features, TData>>;
	data: Array<TData>;
	/** Rows per page on first render. The user can change it from the pager. */
	initialPageSize?: number;
	/** Show the selection summary. Only pass this for column sets that include a checkbox column. */
	enableRowSelection?: boolean;
	/** Placeholder for the search box, so each table can name what it searches. */
	searchPlaceholder?: string;
}

export function DataTable<TData extends RowData>({
	columns,
	data,
	initialPageSize = 10,
	enableRowSelection = false,
	searchPlaceholder = "Search",
}: Readonly<DataTableProps<TData>>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: initialPageSize,
	});

	const table = useTable({
		features,
		data,
		columns,
		globalFilterFn: "fuzzy",
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		state: {
			sorting,
			globalFilter,
			columnVisibility,
			pagination,
		},
	});

	// Reflects the active search, not the raw row count.
	const filteredCount = table.getFilteredRowModel().rows.length;
	// Offer the presets that actually page this dataset, plus an "everything" option.
	// The current size is always included so the Select never falls back to its placeholder.
	const pageSizeOptions = [
		...new Set([
			...PAGE_SIZES.filter((size) => size < data.length),
			pagination.pageSize,
			Math.max(data.length, PAGE_SIZES[0]),
		]),
	].sort((a, b) => a - b);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<Input
					type="search"
					placeholder={searchPlaceholder}
					value={globalFilter}
					onChange={(e) => table.setGlobalFilter(String(e.target.value))}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
								<Settings2Icon />
								View
							</Button>
						}
					/>
					<DropdownMenuContent align="end" className="w-37.5">
						<DropdownMenuGroup>
							<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{table
								.getAllColumns()
								.filter((column) => column.accessorFn !== undefined && column.getCanHide())
								.map((column) => (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) => column.toggleVisibility(!!value)}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								))}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="overflow-hidden border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									{globalFilter ? `No links match “${globalFilter}”.` : "No links yet."}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex flex-col items-stretch justify-start gap-2 px-2">
				{enableRowSelection && (
					<div className="flex-1 text-sm text-muted-foreground">
						{table.getFilteredSelectedRowModel().rows.length} of {filteredCount} row(s) selected.
					</div>
				)}
				<div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
					<div className="flex w-full items-center justify-between gap-2 sm:w-auto">
						<p className="text-sm font-medium">Show</p>
						<Select
							value={`${pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className="h-8 w-17.5 font-mono">
								<SelectValue placeholder={pagination.pageSize} />
							</SelectTrigger>
							<SelectContent side="top" className="font-mono">
								{pageSizeOptions.map((size) => (
									<SelectItem key={size} value={`${size}`}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-sm font-medium">
							of <span className="font-mono">{filteredCount}</span>
						</p>
					</div>
					<div className="flex w-full flex-row items-center justify-between gap-2 sm:w-fit sm:gap-4">
						<p className="flex w-auto items-center justify-center gap-1 text-sm font-medium">
							Page <span className="font-mono">{pagination.pageIndex + 1}</span> of{" "}
							<span className="font-mono">{Math.max(table.getPageCount(), 1)}</span>
						</p>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								className="hidden size-8 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<ChevronsLeftIcon />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<ChevronLeftIcon />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<ChevronRightIcon />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="hidden size-8 lg:flex"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<ChevronsRightIcon />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
