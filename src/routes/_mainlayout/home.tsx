import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainlayout/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return null;
}
