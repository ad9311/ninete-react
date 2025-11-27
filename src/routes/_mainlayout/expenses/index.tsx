import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import Loading from "@/components/Loading";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import { deleteExpense, type Expense, listExpenses } from "@/lib/expense";

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

	const expensesQuery = useQuery({
		queryKey: ["expenses"],
		queryFn: async (): Promise<Expense[]> => {
			const response = await listExpenses(accessToken);
			if (response.error) {
				throw new Error(response.error);
			}

			return response.data || [];
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
					className="rounded-md border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white! transition hover:bg-blue-700"
				>
					Add expense
				</Link>
			</div>

			{expensesQuery.isError ? (
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
					Could not load expenses. Please try again.
				</div>
			) : null}

			{expensesQuery.data && expensesQuery.data.length > 0 ? (
				<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
					<table className="min-w-full divide-y divide-slate-200">
						<thead className="bg-slate-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									Category
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									Description
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									Amount
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									Date
								</th>
								<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{expensesQuery.data?.map((expense) => (
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
		</div>
	);
}
