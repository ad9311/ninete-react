import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainlayout/expenses/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Expense list</div>;
}
