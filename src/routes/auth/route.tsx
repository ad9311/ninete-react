import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isUserSignedIn } = useAuth();

	if (isUserSignedIn) {
		return <Navigate to="/home" />;
	}

	return (
		<>
			<h1>Auth</h1>
			<Outlet />
		</>
	);
}
