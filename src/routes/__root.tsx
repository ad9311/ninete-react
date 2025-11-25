import { TanStackDevtools } from "@tanstack/react-devtools";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RouteComponent,
});

function RouteComponent() {
	const { isPending, error, isFetching, isError } = useQuery({
		queryKey: ["repoData"],
		queryFn: async () => {
			const response = await fetch("http://localhost:8080/users/me");
			return await response.json();
		},
	});

	if (isError) {
		return <h1>{error.message}</h1>;
	}

	if (isPending || isFetching) {
		return <h1>LOADING...</h1>;
	}

	return (
		<>
			<TanStackDevtools
				config={{
					position: "top-right",
					theme: "dark",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
					TanStackQueryDevtools,
				]}
			/>
			<Outlet />
		</>
	);
}
