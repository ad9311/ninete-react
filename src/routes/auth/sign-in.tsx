import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { signInAction, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	const { setSignedIn } = useAuth();
	const mutation = useMutation({
		mutationFn: signInAction,
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
		return <p>LOADING...</p>;
	}

	return (
		<div>
			{error ? <p className="text-red-500">{error}</p> : null}
			<h1>Sign In</h1>
			<form onSubmit={mutation.mutate}>
				<label htmlFor="email">
					<input
						type="email"
						name="email"
						id="email"
						placeholder="Email"
						defaultValue={form?.email}
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
