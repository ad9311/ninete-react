import {
	createFileRoute,
	Link,
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
	const { isUserSignedIn, signOut, user } = useAuth();
	const router = useRouter();
	const redirect = router.state.location.href;

	if (!isUserSignedIn) {
		return <Navigate to="/auth/sign-in" search={{ redirect }} replace />;
	}

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
					<Link
						to="/home"
						className="text-lg font-semibold tracking-tight text-blue-700"
					>
						Ninete
					</Link>
					<div className="flex items-center gap-2">
						<Link
							to="/expenses"
							className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
						>
							Expenses
						</Link>
						{user ? (
							<span className="hidden text-xs font-medium text-slate-500 sm:inline">
								{user.email}
							</span>
						) : null}
						<button
							type="button"
							onClick={() => {
								void signOut();
							}}
							className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
						>
							Sign out
						</button>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-6">
				<Outlet />
			</main>
			<Alert />
		</div>
	);
}
