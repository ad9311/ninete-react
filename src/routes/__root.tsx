import { type QueryClient, useQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { type AuthResponse, useAuth } from "@/lib/auth";
import api from "@/lib/fetch";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RouteComponent,
});

async function refresh(): Promise<AuthResponse> {
	const response = await api.post<AuthResponse>("/auth/refresh");
	if (response.error) {
		throw new Error(response.error);
	}

	return response.data as AuthResponse;
}

function RouteComponent() {
	const { setSignedIn } = useAuth();
	const { isPending, isFetching, isError, error, data } = useQuery({
		queryKey: ["repoData"],
		queryFn: refresh,
	});

	useEffect(() => {
		if (data?.user && data.accessToken) {
			setSignedIn(data.user, data.accessToken.value);
		}
	}, [data, setSignedIn]);

	if (isError) {
		return <h1>{error.message}</h1>;
	}

	if (isPending || isFetching) {
		return <h1>LOADING...</h1>;
	}

	return <Outlet />;
}
