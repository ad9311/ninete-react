import {
	createFileRoute,
	Navigate,
	Outlet,
	useRouter,
} from "@tanstack/react-router";
import { Alert } from "@/components/Alert";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_mainlayout")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isUserSignedIn } = useAuth();
	const router = useRouter();
	const redirect = router.state.location.href;

	if (!isUserSignedIn) {
		return <Navigate to="/auth/sign-in" search={{ redirect }} replace />;
	}

	return (
		<>
			<Outlet />
			<Alert />
		</>
	);
}
