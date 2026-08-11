import { rankItem } from "@tanstack/match-sorter-utils";
import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	tableFeatures,
} from "@tanstack/react-table";

export const features = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: {
		// Declared inline so the callback is contextually typed by tableFeatures.
		fuzzy: (row, columnId, value, addMeta) => {
			const itemRank = rankItem(row.getValue(columnId), value);
			addMeta?.({ itemRank });
			return itemRank.passed;
		},
	},
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime },
	rowSelectionFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	// Required now that pagination happens in memory — without it getRowModel()
	// returns every row and the pager controls do nothing.
	paginatedRowModel: createPaginatedRowModel(),
});
