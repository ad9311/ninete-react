import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect } from "react";
import Loading from "@/components/Loading";
import NewRecurrentExpenseForm from "@/components/recurrent-expense/NewRecurrentExpenseForm";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import { createRecurrentExpenseAction } from "@/lib/recurrent-expense";

export const Route = createFileRoute("/_mainlayout/recurrent-expenses/new")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accessToken } = useAuth();
	const { setAlert } = useAlert();
	const navigate = useNavigate();
	const {
		categories,
		isLoading: categoriesLoading,
		error: categoriesError,
		fetchCategories,
	} = useCategories();
	const mutation = useMutation({
		mutationFn: (event: FormEvent<HTMLFormElement>) =>
			createRecurrentExpenseAction(event, accessToken),
		onSuccess: (response) => {
			if (response.error) {
				setAlert(response.error, "error");
				return;
			}

			setAlert("Recurrent expense saved", "success");
			navigate({ to: "/recurrent-expenses" });
		},
		onError: (error: Error) => setAlert(error.message, "error"),
	});

	useEffect(() => {
		void fetchCategories(accessToken);
	}, [fetchCategories, accessToken]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
						New recurrent expense
					</p>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Create a recurrent expense
					</h1>
					<p className="text-sm text-slate-500">
						Schedule costs that repeat every month or two.
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
				<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
					{categoriesError}
				</div>
			) : null}

			{categoriesLoading && categories.length === 0 ? (
				<Loading label="Loading categories" />
			) : null}

			<NewRecurrentExpenseForm
				defaultValues={{ period: 1 }}
				onSubmit={(event) => mutation.mutate(event)}
				isSubmitting={mutation.isPending}
				categories={categories}
			/>
		</div>
	);
}
