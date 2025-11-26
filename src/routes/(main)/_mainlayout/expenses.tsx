import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/_mainlayout/expenses")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Link to="/home">Home</Link>
			<h1>HOME</h1>
		</div>
	);
}
