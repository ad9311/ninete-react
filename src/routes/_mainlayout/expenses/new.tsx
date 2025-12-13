import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect } from "react";
import NewExpenseForm from "@/components/expense/NewExpenseForm";
import Loading from "@/components/Loading";
import { useAlert } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useCategories } from "@/lib/category";
import { createExpenseAction } from "@/lib/expense";

export const Route = createFileRoute("/_mainlayout/expenses/new")({
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
			createExpenseAction(event, accessToken),
		onSuccess: (response) => {
			if (response.error) {
				setAlert(response.error, "error");
				return;
			}

			setAlert("Expense saved", "success");
			navigate({ to: "/expenses" });
		},
		onError: (error: Error) => setAlert(error.message, "error"),
	});

	const todayLocal = formatLocalDateTime(new Date());

	useEffect(() => {
		void fetchCategories(accessToken);
	}, [fetchCategories, accessToken]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
						New expense
					</p>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Create an expense
					</h1>
					<p className="text-sm text-slate-500">
						Add a new record to keep your spending up to date.
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
				<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
					{categoriesError}
				</div>
			) : null}

			{categoriesLoading && categories.length === 0 ? (
				<Loading label="Loading categories" />
			) : null}

			<NewExpenseForm
				defaultValues={{ date: todayLocal }}
				onSubmit={(event) => mutation.mutate(event)}
				isSubmitting={mutation.isPending}
				categories={categories}
			/>
		</div>
	);
}

function formatLocalDateTime(date: Date): string {
	const pad = (value: number): string => String(value).padStart(2, "0");
	const local = new Date(date);
	local.setSeconds(0, 0);

	const year = local.getFullYear();
	const month = pad(local.getMonth() + 1);
	const day = pad(local.getDate());
	const hours = pad(local.getHours());
	const minutes = pad(local.getMinutes());
	const seconds = pad(local.getSeconds());

	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
