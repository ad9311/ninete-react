import {
	createFileRoute,
	Navigate,
	Outlet,
	useRouter,
} from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/(main)/_mainlayout")({
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
			<h1>Main</h1>
			<Outlet />
		</>
	);
}
