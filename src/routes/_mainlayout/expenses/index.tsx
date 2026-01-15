import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import Loading from "@/components/Loading";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import { deleteExpense, type ExpenseList, listExpenses } from "@/lib/expense";
import ExpenseFilters from "./ExpenseFilters";
import ExpensesTable from "./ExpensesTable";
import { useExpenseQueryOptions } from "./useExpenseQueryOptions";

export const Route = createFileRoute("/_mainlayout/expenses/")({
	component: RouteComponent,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const formatDate = (date: number) =>
	new Date(date * 1000).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

function RouteComponent() {
	const { accessToken } = useAuth();
	const { setAlert } = useAlert();
	const queryClient = useQueryClient();
	const { categories, fetchCategories } = useCategories();
	const {
		queryOptions,
		categoryFilter,
		dateFilter,
		customStart,
		customEnd,
		handleCategoryFilterChange,
		handleDateFilterChange,
		handleCustomDateChange,
		handlePerPageChange,
		toggleSort,
		goToPage,
		resetPage,
	} = useExpenseQueryOptions();

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

	const categoryLookup = useMemo(() => {
		const lookup: Record<string, string> = {};
		categories.forEach((category) => {
			lookup[String(category.id)] = category.name;
		});
		return lookup;
	}, [categories]);

	const handleDelete = (id: number) => {
		if (!window.confirm("Delete this expense?")) return;
		deleteMutation.mutate(id);
	};

	const currentPage =
		expensesQuery.data?.page ?? queryOptions.pagination?.page ?? 1;
	const perPage =
		expensesQuery.data?.perPage ?? queryOptions.pagination?.perPage ?? 20;
	const perPageOptions = Array.from(new Set([perPage, 10, 20, 50])).sort(
		(a, b) => a - b,
	);
	const totalRows = expensesQuery.data?.rows ?? 0;
	const canGoNext = currentPage * perPage < totalRows;
	const canGoPrev = currentPage > 1;
	const totalAmountForPage =
		expensesQuery.data?.items.reduce(
			(sum, expense) => sum + expense.amount / 100,
			0,
		) ?? 0;
	const items = expensesQuery.data?.items ?? [];

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

			<ExpenseFilters
				categories={categories}
				categoryValue={categoryFilter}
				dateValue={dateFilter}
				customStart={customStart}
				customEnd={customEnd}
				onCategoryChange={handleCategoryFilterChange}
				onDateChange={handleDateFilterChange}
				onCustomDateChange={handleCustomDateChange}
				perPage={perPage}
				perPageOptions={perPageOptions}
				onPerPageChange={handlePerPageChange}
				pagination={{
					currentPage,
					canGoPrev,
					canGoNext,
					onPrev: () => goToPage(currentPage - 1),
					onNext: () => goToPage(currentPage + 1),
					onReset: resetPage,
				}}
			/>

			{expensesQuery.isError ? (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
					Could not load expenses. Please try again.
				</div>
			) : null}

			{items.length > 0 ? (
				<ExpensesTable
					items={items}
					sorting={queryOptions.sorting}
					categoryLookup={categoryLookup}
					onToggleSort={toggleSort}
					onDelete={handleDelete}
					isDeleting={deleteMutation.isPending}
					formatCurrency={formatCurrency}
					formatDate={formatDate}
				/>
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
