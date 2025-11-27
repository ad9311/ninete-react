import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect } from "react";
import NewExpenseForm from "@/components/expense/NewExpenseForm";
import Loading from "@/components/Loading";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import { type Expense, getExpense, updateExpenseAction } from "@/lib/expense";

export const Route = createFileRoute("/_mainlayout/expenses/$expenseId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { expenseId } = Route.useParams();
	const { accessToken } = useAuth();
	const { setAlert } = useAlert();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		categories,
		isLoading: categoriesLoading,
		error: categoriesError,
		fetchCategories,
	} = useCategories();

	const expenseQuery = useQuery({
		queryKey: ["expenses", expenseId],
		queryFn: async (): Promise<Expense> => {
			const response = await getExpense(expenseId, accessToken);
			if (response.error) {
				throw new Error(response.error);
			}

			if (!response.data) {
				throw new Error("Expense not found");
			}

			return response.data;
		},
		enabled: Boolean(accessToken),
	});

	const mutation = useMutation({
		mutationFn: (event: FormEvent<HTMLFormElement>) =>
			updateExpenseAction(expenseId, event, accessToken),
		onSuccess: (response) => {
			if (response.error) {
				setAlert(response.error, "error");
				return;
			}

			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["expenses", expenseId] });
			setAlert("Expense updated", "success");
			navigate({ to: "/expenses" });
		},
		onError: (error: Error) => setAlert(error.message, "error"),
	});

	useEffect(() => {
		void fetchCategories(accessToken);
	}, [fetchCategories, accessToken]);

	if (
		expenseQuery.isPending ||
		(categoriesLoading && categories.length === 0)
	) {
		return <Loading label="Loading expense" />;
	}

	if (expenseQuery.isError) {
		return (
			<div className="space-y-4">
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
					Could not load this expense. Please return to the list.
				</div>
				<Link
					to="/expenses"
					className="inline-flex rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
				>
					Back to expenses
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
						Edit expense
					</p>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Update expense
					</h1>
					<p className="text-sm text-slate-500">
						Change any detail and save your updates.
					</p>
				</div>
				<Link
					to="/expenses"
					className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
				>
					Back to list
				</Link>
			</div>

			{categoriesError ? (
				<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
					{categoriesError}
				</div>
			) : null}

			<NewExpenseForm
				defaultValues={expenseQuery.data}
				onSubmit={(event) => mutation.mutate(event)}
				isSubmitting={mutation.isPending}
				submitLabel="Update expense"
				categories={categories}
			/>
		</div>
	);
}
