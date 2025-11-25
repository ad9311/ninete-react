import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/_mainlayout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<h1>Main</h1>
			<Outlet />
		</>
	);
}
