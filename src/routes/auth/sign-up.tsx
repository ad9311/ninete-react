import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useEffect } from "react";
import Loading from "@/components/Loading";
import { signUpAction, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/sign-up")({
	component: RouteComponent,
});

function RouteComponent() {
	const { setSignedIn } = useAuth();
	const mutation = useMutation({
		mutationFn: (event: FormEvent<HTMLFormElement>) => signUpAction(event),
	});
	const data = mutation.data?.data;
	const error =
		mutation.data?.error || (mutation.isError ? mutation.error.message : null);
	const form = mutation.data?.form;

	useEffect(() => {
		if (data?.user && data.accessToken) {
			setSignedIn(data.user, data.accessToken.value);
		}
	}, [data, setSignedIn]);

	if (mutation.isPending) {
		return <Loading label="Creating your account" fullscreen />;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
			<div className="w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-8">
				<div className="space-y-2 text-center">
					<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
						Ninete
					</p>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Sign up
					</h1>
					<p className="text-sm text-slate-500">
						Create your account to start tracking expenses.
					</p>
				</div>

				{error ? (
					<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
						{error}
					</div>
				) : null}

				<form onSubmit={mutation.mutate} className="space-y-4">
					<div className="flex flex-col gap-2 text-left">
						<label
							htmlFor="username"
							className="text-sm font-semibold text-slate-700"
						>
							Username
						</label>
						<input
							type="text"
							name="username"
							id="username"
							placeholder="Username"
							defaultValue={form?.username}
							className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						/>
					</div>

					<div className="flex flex-col gap-2 text-left">
						<label
							htmlFor="email"
							className="text-sm font-semibold text-slate-700"
						>
							Email
						</label>
						<input
							type="email"
							name="email"
							id="email"
							placeholder="Email"
							defaultValue={form?.email}
							className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						/>
					</div>

					<div className="flex flex-col gap-2 text-left">
						<label
							htmlFor="password"
							className="text-sm font-semibold text-slate-700"
						>
							Password
						</label>
						<input
							type="password"
							name="password"
							id="password"
							placeholder="••••••"
							className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						/>
					</div>

					<div className="flex flex-col gap-2 text-left">
						<label
							htmlFor="passwordConfirmation"
							className="text-sm font-semibold text-slate-700"
						>
							Confirm password
						</label>
						<input
							type="password"
							name="passwordConfirmation"
							id="passwordConfirmation"
							placeholder="••••••"
							className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						/>
					</div>

					<button
						type="submit"
						disabled={mutation.isPending}
						className="w-full rounded-md border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
					>
						{mutation.isPending ? "Signing up..." : "Create account"}
					</button>
				</form>

				<div className="text-center text-sm text-slate-500">
					Already have an account?{" "}
					<Link to="/auth/sign-in" className="font-semibold text-blue-700">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
