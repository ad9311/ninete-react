import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/(main)/_mainlayout")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isUserSignedIn } = useAuth();

	if (!isUserSignedIn) {
		return <Navigate to="/auth/sign-in" />;
	}

	return (
		<>
			<h1>Main</h1>
			<Outlet />
		</>
	);
}
