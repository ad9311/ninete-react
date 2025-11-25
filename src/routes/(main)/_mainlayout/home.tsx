import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/_mainlayout/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/auth/home"!</div>;
}
