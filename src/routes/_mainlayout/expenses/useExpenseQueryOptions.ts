import { useCallback, useState } from "react";
import type { QueryOptions } from "@/lib/expense";

export type DateFilterValue =
	| "all"
	| "today"
	| "last7"
	| "thisMonth"
	| "lastMonth"
	| "nextMonth"
	| "sixMonths"
	| "thisYear"
	| "custom";

type FilterField = NonNullable<QueryOptions["filters"]>["fields"][number];

const buildFilters = (
	categoryValue: string,
	dateValue: DateFilterValue,
	startDate: string,
	endDate: string,
): QueryOptions["filters"] => {
	const fields: FilterField[] = [];

	if (categoryValue) {
		fields.push({
			name: "category_id",
			value: Number(categoryValue),
			operator: "=",
		});
	}

	const now = new Date();
	const startOfDaySec = (date: Date): number => {
		const copy = new Date(date);
		copy.setHours(0, 0, 0, 0);
		return Math.floor(copy.getTime() / 1000);
	};
	const endOfDaySec = (date: Date): number => {
		const copy = new Date(date);
		copy.setHours(23, 59, 59, 999);
		return Math.floor(copy.getTime() / 1000);
	};
	const parseInputDate = (value: string): Date | null => {
		if (!value) return null;

		const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
		if (dateOnlyPattern.test(value)) {
			const [year, month, day] = value.split("-").map((part) => Number(part));
			return new Date(year, month - 1, day);
		}

		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	};

	const addDateRange = (start?: number, end?: number) => {
		if (start !== undefined) {
			fields.push({ name: "date", value: start, operator: ">=" });
		}
		if (end !== undefined) {
			fields.push({ name: "date", value: end, operator: "<=" });
		}
	};

	switch (dateValue) {
		case "today": {
			const start = startOfDaySec(now);
			const end = endOfDaySec(now);
			addDateRange(start, end);
			break;
		}
		case "last7": {
			const start = new Date(now);
			start.setDate(now.getDate() - 6);
			addDateRange(startOfDaySec(start), endOfDaySec(now));
			break;
		}
		case "thisMonth": {
			const start = new Date(now.getFullYear(), now.getMonth(), 1);
			addDateRange(startOfDaySec(start), endOfDaySec(now));
			break;
		}
		case "lastMonth": {
			const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const end = new Date(now.getFullYear(), now.getMonth(), 0);
			addDateRange(startOfDaySec(start), endOfDaySec(end));
			break;
		}
		case "nextMonth": {
			const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
			const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
			addDateRange(startOfDaySec(start), endOfDaySec(end));
			break;
		}
		case "sixMonths": {
			const start = new Date(now);
			start.setMonth(now.getMonth() - 6);
			addDateRange(startOfDaySec(start), endOfDaySec(now));
			break;
		}
		case "thisYear": {
			const start = new Date(now.getFullYear(), 0, 1);
			addDateRange(startOfDaySec(start), endOfDaySec(now));
			break;
		}
		case "custom": {
			if (startDate && endDate) {
				const startDateObj = parseInputDate(startDate);
				const endDateObj = parseInputDate(endDate);
				if (startDateObj && endDateObj) {
					addDateRange(startOfDaySec(startDateObj), endOfDaySec(endDateObj));
				}
			}
			break;
		}
		default:
			break;
	}

	return fields.length > 0 ? { fields, connector: "AND" } : undefined;
};

export function useExpenseQueryOptions(initialPerPage = 20) {
	const initialDateFilter: DateFilterValue = "thisMonth";
	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const [dateFilter, setDateFilter] =
		useState<DateFilterValue>(initialDateFilter);
	const [customStart, setCustomStart] = useState<string>("");
	const [customEnd, setCustomEnd] = useState<string>("");
	const [queryOptions, setQueryOptions] = useState<QueryOptions>({
		filters: buildFilters("", initialDateFilter, "", ""),
		sorting: {
			field: "amount",
			order: "desc",
		},
		pagination: {
			perPage: initialPerPage,
			page: 1,
		},
	});

	const updateFilters = useCallback(
		(
			categoryValue: string,
			dateValue: DateFilterValue,
			startDate: string,
			endDate: string,
		) => {
			const filters = buildFilters(
				categoryValue,
				dateValue,
				startDate,
				endDate,
			);
			setQueryOptions((prev) => ({
				...prev,
				filters,
				pagination: {
					perPage: prev.pagination?.perPage ?? initialPerPage,
					page: 1,
				},
			}));
		},
		[initialPerPage],
	);

	const handleCategoryFilterChange = useCallback(
		(value: string) => {
			setCategoryFilter(value);
			updateFilters(value, dateFilter, customStart, customEnd);
		},
		[customEnd, customStart, dateFilter, updateFilters],
	);

	const handleDateFilterChange = useCallback(
		(value: DateFilterValue) => {
			setDateFilter(value);
			const start = value === "custom" ? customStart : "";
			const end = value === "custom" ? customEnd : "";
			updateFilters(categoryFilter, value, start, end);
		},
		[categoryFilter, customEnd, customStart, updateFilters],
	);

	const handleCustomDateChange = useCallback(
		(start: string, end: string) => {
			setCustomStart(start);
			setCustomEnd(end);
			updateFilters(categoryFilter, dateFilter, start, end);
		},
		[categoryFilter, dateFilter, updateFilters],
	);

	const toggleSort = useCallback(
		(field: string) => {
			setQueryOptions((prev) => {
				const isSameField = prev.sorting?.field === field;
				const nextOrder =
					isSameField && prev.sorting?.order === "desc" ? "asc" : "desc";
				return {
					...prev,
					sorting: { field, order: nextOrder },
					pagination: {
						perPage: prev.pagination?.perPage ?? initialPerPage,
						page: 1,
					},
				};
			});
		},
		[initialPerPage],
	);

	const goToPage = useCallback(
		(page: number) => {
			if (page < 1) return;
			setQueryOptions((prev) => ({
				...prev,
				pagination: {
					perPage: prev.pagination?.perPage ?? initialPerPage,
					page,
				},
			}));
		},
		[initialPerPage],
	);

	const resetPage = useCallback(() => {
		setQueryOptions((prev) => ({
			...prev,
			pagination: {
				perPage: prev.pagination?.perPage ?? initialPerPage,
				page: 1,
			},
		}));
	}, [initialPerPage]);

	return {
		queryOptions,
		categoryFilter,
		dateFilter,
		customStart,
		customEnd,
		handleCategoryFilterChange,
		handleDateFilterChange,
		handleCustomDateChange,
		toggleSort,
		goToPage,
		resetPage,
	};
}
