import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Loading from "@/components/Loading";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import {
	deleteExpense,
	type ExpenseList,
	listExpenses,
	type QueryOptions,
} from "@/lib/expense";

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export const Route = createFileRoute("/_mainlayout/expenses/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accessToken } = useAuth();
	const { setAlert } = useAlert();
	const queryClient = useQueryClient();
	const { categories, fetchCategories } = useCategories();
	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const [dateFilter, setDateFilter] = useState<
		| "all"
		| "today"
		| "last7"
		| "thisMonth"
		| "lastMonth"
		| "sixMonths"
		| "thisYear"
		| "custom"
	>("all");
	const [customStart, setCustomStart] = useState<string>("");
	const [customEnd, setCustomEnd] = useState<string>("");
	const [queryOptions, setQueryOptions] = useState<QueryOptions>({
		filters: undefined,
		sorting: {
			field: "amount",
			order: "desc",
		},
		pagination: {
			perPage: 20,
			page: 1,
		},
	});

	type FilterField = NonNullable<QueryOptions["filters"]>["fields"][number];

	const buildFilters = (
		categoryValue: string,
		dateValue: typeof dateFilter,
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
		const startOfDaySec = (date: Date): number =>
			Math.floor(
				Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 1000,
			);
		const endOfDaySec = (date: Date): number =>
			Math.floor(
				Date.UTC(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					23,
					59,
					59,
				) / 1000,
			);

		const addDateRange = (start?: number, end?: number) => {
			if (start !== undefined) {
				fields.push({ name: "date", value: start, operator: ">=" });
			}
			if (end !== undefined) {
				fields.push({ name: "date", value: end, operator: "<=" });
			}
		};

		if (dateValue !== "all") {
			if (dateValue === "today") {
				const start = startOfDaySec(now);
				const end = endOfDaySec(now);
				addDateRange(start, end);
			} else if (dateValue === "last7") {
				const startDate = new Date(now);
				startDate.setDate(now.getDate() - 6);
				addDateRange(startOfDaySec(startDate), endOfDaySec(now));
			} else if (dateValue === "thisMonth") {
				const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
				addDateRange(startOfDaySec(startDate), endOfDaySec(now));
			} else if (dateValue === "lastMonth") {
				const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				const endDatePrev = new Date(now.getFullYear(), now.getMonth(), 0);
				addDateRange(startOfDaySec(startDate), endOfDaySec(endDatePrev));
			} else if (dateValue === "sixMonths") {
				const startDate = new Date(now);
				startDate.setMonth(now.getMonth() - 6);
				addDateRange(startOfDaySec(startDate), endOfDaySec(now));
			} else if (dateValue === "thisYear") {
				const startDate = new Date(now.getFullYear(), 0, 1);
				addDateRange(startOfDaySec(startDate), endOfDaySec(now));
			} else if (dateValue === "custom") {
				if (startDate && endDate) {
					const start = startOfDaySec(new Date(startDate));
					const end = endOfDaySec(new Date(endDate));
					addDateRange(start, end);
				}
			}
		}

		return fields.length > 0 ? { fields, connector: "AND" } : undefined;
	};

	const expensesQuery = useQuery({
		queryKey: ["expenses", queryOptions],
		queryFn: async (): Promise<ExpenseList> => {
			const response = await listExpenses(accessToken, queryOptions);
			if (response.error) {
				throw new Error(response.error);
			}

			return (
				response.data ?? {
					items: [],
					perPage: queryOptions.pagination?.perPage ?? 20,
					page: queryOptions.pagination?.page ?? 1,
					rows: 0,
				}
			);
		},
		enabled: Boolean(accessToken),
	});

	const deleteMutation = useMutation({
		mutationFn: async (expenseId: number) => {
			const response = await deleteExpense(String(expenseId), accessToken);
			if (response.error) {
				throw new Error(response.error);
			}

			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			setAlert("Expense deleted", "success");
		},
		onError: (error: Error) => {
			setAlert(error.message, "error");
		},
	});

	useEffect(() => {
		void fetchCategories(accessToken);
	}, [fetchCategories, accessToken]);

	const updateFilters = (
		categoryValue: string,
		dateValue: typeof dateFilter,
		startDate: string,
		endDate: string,
	) => {
		const filters = buildFilters(categoryValue, dateValue, startDate, endDate);
		setQueryOptions((prev) => ({
			...prev,
			filters,
			pagination: {
				perPage: prev.pagination?.perPage ?? 20,
				page: 1,
			},
		}));
	};

	const categoryLookup = useMemo(() => {
		const lookup: Record<string, string> = {};
		categories.forEach((category) => {
			lookup[String(category.id)] = category.name;
		});
		return lookup;
	}, [categories]);

	const formatCurrency = (amount: number) => currencyFormatter.format(amount);

	const formatDate = (date: number) =>
		new Date(date * 1000).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	const handleDelete = (id: number) => {
		if (!window.confirm("Delete this expense?")) return;
		deleteMutation.mutate(id);
	};

	const handleCategoryFilterChange = (value: string) => {
		setCategoryFilter(value);
		updateFilters(value, dateFilter, customStart, customEnd);
	};

	const handleDateFilterChange = (value: typeof dateFilter) => {
		setDateFilter(value);
		const nextStart = value === "custom" ? customStart : "";
		const nextEnd = value === "custom" ? customEnd : "";
		updateFilters(categoryFilter, value, nextStart, nextEnd);
	};

	const handleCustomDateChange = (start: string, end: string) => {
		setCustomStart(start);
		setCustomEnd(end);
		updateFilters(categoryFilter, dateFilter, start, end);
	};

	const toggleSort = (field: string) => {
		setQueryOptions((prev) => {
			const isSameField = prev.sorting?.field === field;
			const nextOrder =
				isSameField && prev.sorting?.order === "desc" ? "asc" : "desc";
			return {
				...prev,
				sorting: { field, order: nextOrder },
				pagination: {
					perPage: prev.pagination?.perPage ?? 20,
					page: 1,
				},
			};
		});
	};

	const goToPage = (page: number) => {
		if (page < 1) return;
		setQueryOptions((prev) => ({
			...prev,
			pagination: {
				perPage: prev.pagination?.perPage ?? 20,
				page,
			},
		}));
	};

	const currentPage =
		expensesQuery.data?.page ?? queryOptions.pagination?.page ?? 1;
	const perPage =
		expensesQuery.data?.perPage ?? queryOptions.pagination?.perPage ?? 20;
	const totalRows = expensesQuery.data?.rows ?? 0;
	const canGoNext = currentPage * perPage < totalRows;
	const canGoPrev = currentPage > 1;
	const totalAmountForPage =
		expensesQuery.data?.items.reduce(
			(sum, expense) => sum + expense.amount / 100,
			0,
		) ?? 0;

	if (expensesQuery.isPending) {
		return <Loading label="Loading expenses" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Expenses
					</h1>
					<p className="text-sm text-slate-500">
						Track and update your spending.
					</p>
				</div>

				<Link
					to="/expenses/new"
					className="rounded-md border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
					style={{ color: "white" }}
				>
					Add expense
				</Link>
			</div>

			<div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
				<div className="flex flex-wrap items-end gap-3">
					<div className="flex flex-col gap-1">
						<label
							htmlFor="filter-category"
							className="text-xs font-semibold uppercase tracking-wide text-slate-500"
						>
							Category filter
						</label>
						<select
							id="filter-category"
							value={categoryFilter}
							onChange={(e) => handleCategoryFilterChange(e.target.value)}
							className="w-48 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						>
							<option value="">All categories</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col gap-1">
						<label
							htmlFor="filter-date"
							className="text-xs font-semibold uppercase tracking-wide text-slate-500"
						>
							Date filter
						</label>
						<select
							id="filter-date"
							value={dateFilter}
							onChange={(e) =>
								handleDateFilterChange(e.target.value as typeof dateFilter)
							}
							className="w-48 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						>
							<option value="all">All dates</option>
							<option value="today">Today</option>
							<option value="last7">Last 7 days</option>
							<option value="thisMonth">This month</option>
							<option value="lastMonth">Last month</option>
							<option value="sixMonths">Last 6 months</option>
							<option value="thisYear">This year (so far)</option>
							<option value="custom">Custom range</option>
						</select>
					</div>

					{dateFilter === "custom" ? (
						<div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
							<label className="flex flex-col gap-1">
								<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									From
								</span>
								<input
									type="date"
									value={customStart}
									onChange={(e) =>
										handleCustomDateChange(e.target.value, customEnd)
									}
									className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
								/>
							</label>
							<label className="flex flex-col gap-1">
								<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									To
								</span>
								<input
									type="date"
									value={customEnd}
									onChange={(e) =>
										handleCustomDateChange(customStart, e.target.value)
									}
									className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
								/>
							</label>
						</div>
					) : null}
				</div>

				<div className="flex items-center gap-2 text-sm text-slate-600">
					<button
						type="button"
						onClick={() =>
							setQueryOptions((prev) => ({
								...prev,
								pagination: {
									perPage: prev.pagination?.perPage ?? 20,
									page: 1,
								},
							}))
						}
						className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
					>
						Reset page
					</button>
					<span className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
						Page {currentPage}
					</span>
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => goToPage((queryOptions.pagination?.page ?? 1) - 1)}
							disabled={!canGoPrev}
							className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Prev
						</button>
						<button
							type="button"
							onClick={() => goToPage((queryOptions.pagination?.page ?? 1) + 1)}
							disabled={!canGoNext}
							className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Next
						</button>
					</div>
				</div>
			</div>

			{expensesQuery.isError ? (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
					Could not load expenses. Please try again.
				</div>
			) : null}

			{expensesQuery.data && expensesQuery.data.items.length > 0 ? (
				<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
					<table className="min-w-full divide-y divide-slate-200">
						<thead className="bg-slate-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									<button
										type="button"
										onClick={() => toggleSort("category_id")}
										className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700"
									>
										<span>Category</span>
										{queryOptions.sorting?.field === "category_id" ? (
											<span>
												{queryOptions.sorting.order === "desc" ? "↓" : "↑"}
											</span>
										) : null}
									</button>
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									Description
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									<button
										type="button"
										onClick={() => toggleSort("amount")}
										className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700"
									>
										<span>Amount</span>
										{queryOptions.sorting?.field === "amount" ? (
											<span>
												{queryOptions.sorting.order === "desc" ? "↓" : "↑"}
											</span>
										) : null}
									</button>
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									<button
										type="button"
										onClick={() => toggleSort("date")}
										className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700"
									>
										<span>Date</span>
										{queryOptions.sorting?.field === "date" ? (
											<span>
												{queryOptions.sorting.order === "desc" ? "↓" : "↑"}
											</span>
										) : null}
									</button>
								</th>
								<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{expensesQuery.data?.items.map((expense) => (
								<tr key={expense.id} className="hover:bg-slate-50">
									<td className="px-4 py-3 text-sm font-semibold text-slate-800">
										{categoryLookup[String(expense.categoryId)] ??
											expense.categoryId}
									</td>
									<td className="px-4 py-3 text-sm text-slate-600">
										{expense.description || "—"}
									</td>
									<td className="px-4 py-3 text-sm font-semibold text-slate-900">
										{formatCurrency(expense.amount / 100)}
									</td>
									<td className="px-4 py-3 text-sm text-slate-600">
										{expense.date ? formatDate(expense.date) : "—"}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-2">
											<Link
												to="/expenses/$expenseId"
												params={{ expenseId: String(expense.id) }}
												className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
											>
												Edit
											</Link>
											<button
												type="button"
												onClick={() => handleDelete(expense.id)}
												disabled={deleteMutation.isPending}
												className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
											>
												{deleteMutation.isPending ? "Deleting..." : "Delete"}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : !expensesQuery.isError ? (
				<div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
					No expenses yet. Start by adding your first one.
				</div>
			) : null}

			{expensesQuery.data ? (
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							Total this page: {formatCurrency(totalAmountForPage)}
						</span>
						<span className="text-slate-500">
							({expensesQuery.data.items.length} of {expensesQuery.data.rows}{" "}
							items)
						</span>
					</div>
					<div className="text-slate-500">
						Page {currentPage} /{" "}
						{Math.max(1, Math.ceil(totalRows / perPage || 1))}
					</div>
				</div>
			) : null}
		</div>
	);
}
