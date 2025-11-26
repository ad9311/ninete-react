export type AppResponse<T> = {
	data: T | null;
	error: string | null;
	meta?: string;
};

export type FetchOptions = {
	accessToken?: string;
	headers?: HeadersInit;
	body?: Record<string, string | number>;
};

function setBaseHeaders(method: string, accessToken?: string): HeadersInit {
	let base: HeadersInit = { Accept: "application/json" };

	if (accessToken) {
		base = { ...base, Authorization: `Bearer ${accessToken}` };
	}

	if (method !== "GET") {
		base = { ...base, "Content-Type": "application/json" };
	}

	return base;
}

async function fetchBase(
	url: string,
	method: string,
	opts?: FetchOptions,
): Promise<Response> {
	const baseHeaders = setBaseHeaders(method, opts?.accessToken);
	const headers = opts?.headers
		? { ...baseHeaders, ...opts.headers }
		: baseHeaders;

	return await fetch(url, {
		method,
		headers,
		credentials: "include",
		body: opts?.body && JSON.stringify(opts.body),
	});
}

async function fetchGet<T>(
	path: string,
	opts?: FetchOptions,
): Promise<AppResponse<T>> {
	const response = await fetchBase(
		`${import.meta.env.VITE_API_URL}${path}`,
		"GET",
		opts,
	);

	return (await response.json()) as AppResponse<T>;
}

async function fetchPost<T>(
	path: string,
	opts?: FetchOptions,
): Promise<AppResponse<T>> {
	const response = await fetchBase(
		`${import.meta.env.VITE_API_URL}${path}`,
		"POST",
		opts,
	);

	return (await response.json()) as AppResponse<T>;
}

async function fetchPatch<T>(
	path: string,
	opts?: FetchOptions,
): Promise<AppResponse<T>> {
	const response = await fetchBase(
		`${import.meta.env.VITE_API_URL}${path}`,
		"PATCH",
		opts,
	);

	return (await response.json()) as AppResponse<T>;
}

async function fetchPut<T>(
	path: string,
	opts?: FetchOptions,
): Promise<AppResponse<T>> {
	const response = await fetchBase(
		`${import.meta.env.VITE_API_URL}${path}`,
		"PUT",
		opts,
	);

	return (await response.json()) as AppResponse<T>;
}

async function fetchDelete<T>(
	path: string,
	opts?: FetchOptions,
): Promise<AppResponse<T>> {
	const response = await fetchBase(
		`${import.meta.env.VITE_API_URL}${path}`,
		"DELETE",
		opts,
	);

	return (await response.json()) as AppResponse<T>;
}

const api = {
	get: fetchGet,
	post: fetchPost,
	patch: fetchPatch,
	put: fetchPut,
	delete: fetchDelete,
};

export default api;
