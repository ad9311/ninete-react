import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import Loading from "@/components/Loading";
import RecurrentExpenseFilters from "@/components/recurrent-expense/RecurrentExpenseFilters";
import RecurrentExpensesTable from "@/components/recurrent-expense/RecurrentExpensesTable";
import { useRecurrentExpenseQueryOptions } from "@/hooks/recurrent-expense/useRecurrentExpenseQueryOptions";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import {
	deleteRecurrentExpense,
	listRecurrentExpenses,
	type RecurrentExpenseList,
} from "@/lib/recurrent-expense";

export const Route = createFileRoute("/_mainlayout/recurrent-expenses/")({
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
		handleCategoryFilterChange,
		handlePerPageChange,
		toggleSort,
		goToPage,
		resetPage,
	} = useRecurrentExpenseQueryOptions();

	const recurrentQuery = useQuery({
		queryKey: ["recurrent-expenses", queryOptions],
		queryFn: async (): Promise<RecurrentExpenseList> => {
			const response = await listRecurrentExpenses(accessToken, queryOptions);
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
		mutationFn: async (recurrentExpenseId: number) => {
			const response = await deleteRecurrentExpense(
				String(recurrentExpenseId),
				accessToken,
			);
			if (response.error) {
				throw new Error(response.error);
			}

			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recurrent-expenses"] });
			setAlert("Recurrent expense deleted", "success");
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
		if (!window.confirm("Delete this recurrent expense?")) return;
		deleteMutation.mutate(id);
	};

	const currentPage =
		recurrentQuery.data?.page ?? queryOptions.pagination?.page ?? 1;
	const perPage =
		recurrentQuery.data?.perPage ?? queryOptions.pagination?.perPage ?? 20;
	const perPageOptions = Array.from(new Set([perPage, 10, 20, 50])).sort(
		(a, b) => a - b,
	);
	const totalRows = recurrentQuery.data?.rows ?? 0;
	const canGoNext = currentPage * perPage < totalRows;
	const canGoPrev = currentPage > 1;
	const totalAmountForPage =
		recurrentQuery.data?.items.reduce(
			(sum, expense) => sum + expense.amount / 100,
			0,
		) ?? 0;
	const items = recurrentQuery.data?.items ?? [];

	if (recurrentQuery.isPending) {
		return <Loading label="Loading recurrent expenses" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Recurrent Expenses
					</h1>
					<p className="text-sm text-slate-500">
						Plan repeating costs and keep them on schedule.
					</p>
				</div>

				<Link
					to="/recurrent-expenses/new"
					className="rounded-md border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
					style={{ color: "white" }}
				>
					Add recurrent expense
				</Link>
			</div>

			<RecurrentExpenseFilters
				categories={categories}
				categoryValue={categoryFilter}
				onCategoryChange={handleCategoryFilterChange}
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

			{recurrentQuery.isError ? (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
					Could not load recurrent expenses. Please try again.
				</div>
			) : null}

			{items.length > 0 ? (
				<RecurrentExpensesTable
					items={items}
					sorting={queryOptions.sorting}
					categoryLookup={categoryLookup}
					onToggleSort={toggleSort}
					onDelete={handleDelete}
					isDeleting={deleteMutation.isPending}
					formatCurrency={formatCurrency}
					formatDate={formatDate}
				/>
			) : !recurrentQuery.isError ? (
				<div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
					No recurrent expenses yet.
				</div>
			) : null}

			{recurrentQuery.data ? (
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							Total this page: {formatCurrency(totalAmountForPage)}
						</span>
						<span className="text-slate-500">
							({recurrentQuery.data.items.length} of {recurrentQuery.data.rows}{" "}
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
