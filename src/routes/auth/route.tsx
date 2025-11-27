import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

type AuthSearch = {
	redirect?: string;
};

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
	validateSearch: (search): AuthSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
});

function RouteComponent() {
	const { isUserSignedIn } = useAuth();
	const { redirect } = Route.useSearch();

	if (isUserSignedIn) {
		return <Navigate to={redirect || "/home"} replace />;
	}

	return <Outlet />;
}
