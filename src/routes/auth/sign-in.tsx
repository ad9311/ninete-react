import { createFileRoute } from "@tanstack/react-router";
import { useActionState } from "react";
import type { FormAction } from "@/lib";
import { type AuthResponse, signInAction } from "@/lib/auth";

export const Route = createFileRoute("/auth/sign-in")({
	component: RouteComponent,
});

const initState: FormAction<AuthResponse> = {
	data: null,
	error: null,
	form: { email: "" },
};

function RouteComponent() {
	const [state, action, isPending] = useActionState(signInAction, initState);

	if (isPending) {
		return <p>LOADING...</p>;
	}

	return (
		<div>
			<p className="text-red-500">{state.error}</p>
			<h1>Sign In</h1>
			<form action={action}>
				<label htmlFor="email">
					<input
						type="email"
						name="email"
						id="email"
						placeholder="Email"
						defaultValue={state.form.email}
					/>
				</label>
				<br />
				<label htmlFor="password">
					<input
						type="password"
						name="password"
						id="password"
						placeholder="****"
					/>
				</label>
				<button type="submit">Sign in!</button>
			</form>
		</div>
	);
}
