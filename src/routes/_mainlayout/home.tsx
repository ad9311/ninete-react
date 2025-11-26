import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainlayout/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Link to="/expenses">Expenses</Link>
			<h1>HOME</h1>
		</div>
	);
}
