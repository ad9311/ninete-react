import { createFileRoute } from "@tanstack/react-router";
import NewExpenseForm from "@/components/expense/NewExpenseForm";

export const Route = createFileRoute("/_mainlayout/expenses/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<NewExpenseForm />
		</div>
	);
}
