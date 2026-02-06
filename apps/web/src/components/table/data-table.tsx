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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from "lucide-react";

import { useState } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import type { ColumnDef, FilterFn, SortingState, VisibilityState } from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
	columns: Array<ColumnDef<TData, TValue>>;
	data: Array<TData>;
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<any>("");
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
		// Rank the item
		const itemRank = rankItem(row.getValue(columnId), value);

		// Store the itemRank info
		addMeta({ itemRank });

		// Return if the item should be filtered in/out
		return itemRank.passed;
	};
	const table = useReactTable({
		data,
		columns,
		filterFns: {
			fuzzy: fuzzyFilter,
		},
		// @ts-expect-error - fuzzy is custom filter function
		globalFilterFn: "fuzzy",
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			globalFilter,
			columnVisibility,
		},
	});

	return (
		<div>
			<div className="flex items-center py-4">
				<Input
					type="search"
					placeholder="Search Contents"
					value={globalFilter}
					onChange={(e) => table.setGlobalFilter(String(e.target.value))}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
								<Settings2 />
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
								.filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
								.map((column) => {
									const isVisible = column.getIsVisible();
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={isVisible}
											onCheckedChange={(value) => column.toggleVisibility(!!value)}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="overflow-hidden border">
				<Table>
					<TableHeader className="">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="mt-2 flex flex-col items-stretch justify-start gap-1 px-2">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex items-center justify-between space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">Rows per page</p>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className="h-8 w-17.5">
								<SelectValue placeholder={table.getState().pagination.pageSize} />
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 20, 25, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex">
						<div className="flex w-25 items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								className="hidden size-8 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<ChevronsLeft />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<ChevronLeft />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<ChevronRight />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="hidden size-8 lg:flex"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<ChevronsRight />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
