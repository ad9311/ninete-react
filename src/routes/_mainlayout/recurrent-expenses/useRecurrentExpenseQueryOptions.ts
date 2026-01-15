import { useCallback, useState } from "react";
import type { QueryOptions } from "@/lib/recurrent-expense";

export function useRecurrentExpenseQueryOptions(initialPerPage = 20) {
	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const [queryOptions, setQueryOptions] = useState<QueryOptions>({
		filters: categoryFilter
			? {
					fields: [
						{
							name: "category_id",
							value: Number(categoryFilter),
							operator: "=",
						},
					],
					connector: "AND",
				}
			: undefined,
		sorting: {
			field: "amount",
			order: "desc",
		},
		pagination: {
			perPage: initialPerPage,
			page: 1,
		},
	});

	const handleCategoryFilterChange = useCallback(
		(value: string) => {
			setCategoryFilter(value);
			setQueryOptions((prev) => ({
				...prev,
				filters: value
					? {
							fields: [
								{
									name: "category_id",
									value: Number(value),
									operator: "=",
								},
							],
							connector: "AND",
						}
					: undefined,
				pagination: {
					perPage: prev.pagination?.perPage ?? initialPerPage,
					page: 1,
				},
			}));
		},
		[initialPerPage],
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

	const handlePerPageChange = useCallback((value: number) => {
		setQueryOptions((prev) => ({
			...prev,
			pagination: {
				perPage: value,
				page: 1,
			},
		}));
	}, []);

	return {
		queryOptions,
		categoryFilter,
		handleCategoryFilterChange,
		handlePerPageChange,
		toggleSort,
		goToPage,
		resetPage,
	};
}
