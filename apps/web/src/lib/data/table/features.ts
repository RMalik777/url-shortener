import { rankItem } from "@tanstack/match-sorter-utils";
import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createSortedRowModel,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	tableFeatures,
} from "@tanstack/react-table";

import type { FilterFn } from "@tanstack/react-table";

const fuzzyFilter: FilterFn<any, any> = (row, columnId, value, addMeta) => {
	const itemRank = rankItem(row.getValue(columnId), value);
	addMeta?.({ itemRank });
	return itemRank.passed;
};

export const features = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: { fuzzy: fuzzyFilter },
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime },
	rowSelectionFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
});
