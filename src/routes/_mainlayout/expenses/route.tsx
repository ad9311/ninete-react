import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainlayout/expenses")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
