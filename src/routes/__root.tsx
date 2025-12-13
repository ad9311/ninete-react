import { type QueryClient, useQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import Loading from "@/components/Loading";
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
	const { setSignedIn, setSignedOut } = useAuth();
	const { isPending, isFetching, isError, data } = useQuery({
		queryKey: ["authRefresh"],
		queryFn: refresh,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});

	useEffect(() => {
		if (data?.user && data.accessToken) {
			setSignedIn(data.user, data.accessToken.value);
		}
	}, [data, setSignedIn]);

	useEffect(() => {
		if (isError) {
			setSignedOut();
		}
	}, [isError, setSignedOut]);

	if (isPending || isFetching) {
		return <Loading label="Loading session" fullscreen />;
	}

	return <Outlet />;
}
