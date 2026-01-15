import type { FormEvent } from "react";
import type { FormAction } from "..";
import { formDataGet, newFormData } from "..";
import type { AppResponse } from "../fetch";
import api from "../fetch";

export type RecurrentExpense = {
	id: number;
	userId: number;
	categoryId: number;
	description: string;
	amount: number; // stored as cents
	period: number; // months
	lastCopyCreated?: number | null;
	createdAt: number;
	updatedAt: number;
};

export type RecurrentExpensePayload = {
	categoryId: number;
	description: string;
	amount: number; // cents
	period: number; // months
};

export type RecurrentExpenseList = {
	items: RecurrentExpense[];
	perPage: number;
	page: number;
	rows: number;
};

export type QueryOptions = {
	filters?: {
		fields: Array<{
			name: string;
			value: number | string;
			operator: "=" | "!=" | ">" | "<" | ">=" | "<=";
		}>;
		connector?: "AND" | "OR";
	};
	sorting?: {
		field: string;
		order: "asc" | "desc";
	};
	pagination?: {
		perPage: number;
		page: number;
	};
};

type RawRecurrentExpense = Partial<{
	id: string | number;
	userId: string | number;
	user_id: string | number;
	categoryId: string | number;
	category_id: string | number;
	description: string;
	amount: string | number;
	period: string | number;
	lastCopyCreated: string | number | null;
	last_copy_created: string | number | null;
	createdAt: string | number;
	created_at: string | number;
	updatedAt: string | number;
	updated_at: string | number;
}>;

function toNumber(value: unknown): number {
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		return Number.isNaN(parsed) ? 0 : parsed;
	}
	return 0;
}

function normalizeDateValue(value: unknown): number {
	if (typeof value === "number") {
		return Math.floor(value > 1_000_000_000_000 ? value / 1000 : value);
	}

	if (typeof value === "string") {
		const numeric = Number(value);
		if (!Number.isNaN(numeric)) {
			return Math.floor(numeric > 1_000_000_000_000 ? numeric / 1000 : numeric);
		}

		const parsed = Date.parse(value);
		if (!Number.isNaN(parsed)) {
			return Math.floor(parsed / 1000);
		}
	}

	return 0;
}

function normalizeRecurrentExpense(raw: unknown): RecurrentExpense {
	const data = (raw ?? {}) as RawRecurrentExpense;
	const rawAmount = toNumber(data.amount);
	const amount =
		Number.isInteger(rawAmount) && rawAmount !== 0
			? rawAmount
			: Math.round(rawAmount * 100);
	const lastCopyRaw = data.lastCopyCreated ?? data.last_copy_created ?? null;
	const lastCopyCreated =
		lastCopyRaw === null || lastCopyRaw === undefined
			? null
			: normalizeDateValue(lastCopyRaw);

	return {
		id: Math.trunc(toNumber(data.id)),
		userId: Math.trunc(toNumber(data.userId ?? data.user_id ?? 0)),
		categoryId: Math.trunc(toNumber(data.categoryId ?? data.category_id ?? 0)),
		description: typeof data.description === "string" ? data.description : "",
		amount,
		period: Math.trunc(toNumber(data.period)),
		lastCopyCreated,
		createdAt: normalizeDateValue(data.createdAt ?? data.created_at),
		updatedAt: normalizeDateValue(data.updatedAt ?? data.updated_at),
	};
}

function parseMetaRecord(meta: unknown): Record<string, unknown> | null {
	if (!meta) return null;
	if (typeof meta === "object") {
		return meta as Record<string, unknown>;
	}
	if (typeof meta === "string") {
		try {
			const parsed = JSON.parse(meta) as unknown;
			return parsed && typeof parsed === "object"
				? (parsed as Record<string, unknown>)
				: null;
		} catch {
			return null;
		}
	}
	return null;
}

function pickNumber(...values: unknown[]): number | undefined {
	for (const value of values) {
		if (value === null || value === undefined) continue;
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return undefined;
}

export function recurrentExpensePayloadFromForm(
	event: FormEvent<HTMLFormElement>,
): RecurrentExpensePayload {
	const formData = newFormData(event);
	const categoryId = Number(formDataGet(formData, "categoryId"));
	const periodInput = Number.parseInt(formDataGet(formData, "period"), 10);
	const amountInput = Number.parseFloat(formDataGet(formData, "amount"));
	const amount =
		Number.isNaN(amountInput) || !Number.isFinite(amountInput)
			? 0
			: Math.round(amountInput * 100);
	const period = Number.isNaN(periodInput) ? 0 : Math.trunc(periodInput);

	return {
		categoryId: Number.isNaN(categoryId) ? 0 : categoryId,
		description: formDataGet(formData, "description"),
		amount,
		period,
	};
}

export async function listRecurrentExpenses(
	accessToken?: string,
	queryOptions?: QueryOptions,
): Promise<AppResponse<RecurrentExpenseList>> {
	const queryParam = queryOptions
		? `?query_options=${encodeURIComponent(JSON.stringify(queryOptions))}`
		: "";
	const response = await api.get<RecurrentExpenseList>(
		`/recurrent-expenses${queryParam}`,
		{
			accessToken,
		},
	);

	const responseRecord = response as Record<string, unknown>;
	const data = response.data as unknown;
	const dataRecord =
		data && typeof data === "object" && !Array.isArray(data)
			? (data as Record<string, unknown>)
			: null;
	const metaRecord = parseMetaRecord(responseRecord.meta ?? response.meta);
	const itemsRaw = Array.isArray(data)
		? data
		: Array.isArray(dataRecord?.items)
			? (dataRecord.items as unknown[])
			: Array.isArray(dataRecord?.data)
				? (dataRecord.data as unknown[])
				: Array.isArray(responseRecord.items)
					? (responseRecord.items as unknown[])
					: [];
	const perPage =
		pickNumber(
			dataRecord?.perPage,
			responseRecord.perPage,
			metaRecord?.perPage,
			queryOptions?.pagination?.perPage,
		) ?? 0;
	const page =
		pickNumber(
			dataRecord?.page,
			responseRecord.page,
			metaRecord?.page,
			queryOptions?.pagination?.page,
		) ?? 1;
	const rows =
		pickNumber(dataRecord?.rows, responseRecord.rows, metaRecord?.rows) ??
		itemsRaw.length;

	return {
		...response,
		data: {
			items: itemsRaw.map((item) => normalizeRecurrentExpense(item)),
			perPage,
			page,
			rows,
		},
	};
}

export async function getRecurrentExpense(
	id: string,
	accessToken?: string,
): Promise<AppResponse<RecurrentExpense>> {
	const response = await api.get<RecurrentExpense>(
		`/recurrent-expenses/${id}`,
		{
			accessToken,
		},
	);

	return {
		...response,
		data: response.data ? normalizeRecurrentExpense(response.data) : null,
	};
}

export async function createRecurrentExpense(
	payload: RecurrentExpensePayload,
	accessToken?: string,
): Promise<AppResponse<RecurrentExpense>> {
	const response = await api.post<RecurrentExpense>("/recurrent-expenses", {
		body: payload,
		accessToken,
	});

	return {
		...response,
		data: response.data ? normalizeRecurrentExpense(response.data) : null,
	};
}

export async function updateRecurrentExpense(
	id: string,
	payload: RecurrentExpensePayload,
	accessToken?: string,
): Promise<AppResponse<RecurrentExpense>> {
	const response = await api.put<RecurrentExpense>(
		`/recurrent-expenses/${id}`,
		{
			body: payload,
			accessToken,
		},
	);

	return {
		...response,
		data: response.data ? normalizeRecurrentExpense(response.data) : null,
	};
}

export async function patchRecurrentExpense(
	id: string,
	payload: RecurrentExpensePayload,
	accessToken?: string,
): Promise<AppResponse<RecurrentExpense>> {
	const response = await api.patch<RecurrentExpense>(
		`/recurrent-expenses/${id}`,
		{
			body: payload,
			accessToken,
		},
	);

	return {
		...response,
		data: response.data ? normalizeRecurrentExpense(response.data) : null,
	};
}

export async function deleteRecurrentExpense(
	id: string,
	accessToken?: string,
): Promise<AppResponse<null>> {
	return api.delete<null>(`/recurrent-expenses/${id}`, { accessToken });
}

export async function createRecurrentExpenseAction(
	event: FormEvent<HTMLFormElement>,
	accessToken?: string,
): Promise<FormAction<RecurrentExpense>> {
	const payload = recurrentExpensePayloadFromForm(event);

	try {
		const response = await createRecurrentExpense(payload, accessToken);
		return { ...response, form: payload };
	} catch (e) {
		return {
			data: null,
			error: (e as Error)?.message,
			form: payload,
		};
	}
}

export async function updateRecurrentExpenseAction(
	id: string,
	event: FormEvent<HTMLFormElement>,
	accessToken?: string,
): Promise<FormAction<RecurrentExpense>> {
	const payload = recurrentExpensePayloadFromForm(event);

	try {
		const response = await updateRecurrentExpense(id, payload, accessToken);
		return { ...response, form: payload };
	} catch (e) {
		return {
			data: null,
			error: (e as Error)?.message,
			form: payload,
		};
	}
}
