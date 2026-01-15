import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect } from "react";
import Loading from "@/components/Loading";
import NewRecurrentExpenseForm from "@/components/recurrent-expense/NewRecurrentExpenseForm";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import {
	getRecurrentExpense,
	type RecurrentExpense,
	updateRecurrentExpenseAction,
} from "@/lib/recurrent-expense";

export const Route = createFileRoute(
	"/_mainlayout/recurrent-expenses/$recurrentExpenseId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { recurrentExpenseId } = Route.useParams();
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
		queryKey: ["recurrent-expenses", recurrentExpenseId],
		queryFn: async (): Promise<RecurrentExpense> => {
			const response = await getRecurrentExpense(
				recurrentExpenseId,
				accessToken,
			);
			if (response.error) {
				throw new Error(response.error);
			}

			if (!response.data) {
				throw new Error("Recurrent expense not found");
			}

			return response.data;
		},
		enabled: Boolean(accessToken),
	});

	const mutation = useMutation({
		mutationFn: (event: FormEvent<HTMLFormElement>) =>
			updateRecurrentExpenseAction(recurrentExpenseId, event, accessToken),
		onSuccess: (response) => {
			if (response.error) {
				setAlert(response.error, "error");
				return;
			}

			queryClient.invalidateQueries({ queryKey: ["recurrent-expenses"] });
			queryClient.invalidateQueries({
				queryKey: ["recurrent-expenses", recurrentExpenseId],
			});
			setAlert("Recurrent expense updated", "success");
			navigate({ to: "/recurrent-expenses" });
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
		return <Loading label="Loading recurrent expense" />;
	}

	if (expenseQuery.isError) {
		return (
			<div className="space-y-4">
				<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
					Could not load this recurrent expense. Please return to the list.
				</div>
				<Link
					to="/recurrent-expenses"
					className="inline-flex rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
				>
					Back to recurrent expenses
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
						Edit recurrent expense
					</p>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Update recurrent expense
					</h1>
					<p className="text-sm text-slate-500">
						Adjust timing or details for this repeating cost.
					</p>
				</div>
				<Link
					to="/recurrent-expenses"
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

			<NewRecurrentExpenseForm
				defaultValues={expenseQuery.data}
				onSubmit={(event) => mutation.mutate(event)}
				isSubmitting={mutation.isPending}
				submitLabel="Update recurrent expense"
				categories={categories}
			/>
		</div>
	);
}
