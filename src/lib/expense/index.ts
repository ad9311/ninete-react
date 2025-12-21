import type { FormEvent } from "react";
import type { FormAction } from "..";
import { formDataGet, newFormData } from "..";
import type { AppResponse } from "../fetch";
import api from "../fetch";

export type Expense = {
	id: number;
	categoryId: number;
	description: string;
	amount: number; // stored as cents
	date: number;
};

export type ExpensePayload = {
	categoryId: number;
	description: string;
	amount: number; // cents
	date: string; // RFC3339 local time
};

export type ExpenseList = {
	items: Expense[];
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

function parseDateString(dateValue: string): number {
	if (!dateValue) return 0;

	const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
	if (isoDatePattern.test(dateValue)) {
		const [year, month, day] = dateValue.split("-").map((part) => Number(part));
		const utcMillis = Date.UTC(year, month - 1, day, 0, 0, 0);
		return Math.floor(utcMillis / 1000);
	}

	const numeric = Number(dateValue);
	if (!Number.isNaN(numeric)) {
		return Math.floor(numeric > 1_000_000_000_000 ? numeric / 1000 : numeric);
	}

	const parsed = Date.parse(dateValue);
	if (Number.isNaN(parsed)) return 0;
	return Math.floor(parsed / 1000);
}

function toRFC3339Local(dateValue: string): string {
	if (!dateValue) return "";

	const pad = (value: number): string => String(value).padStart(2, "0");
	const buildString = (date: Date): string => {
		const offsetMinutes = date.getTimezoneOffset();
		const sign = offsetMinutes > 0 ? "-" : "+";
		const absOffset = Math.abs(offsetMinutes);
		const offsetHours = pad(Math.floor(absOffset / 60));
		const offsetMins = pad(absOffset % 60);
		const timezone =
			offsetMinutes === 0 ? "Z" : `${sign}${offsetHours}:${offsetMins}`;

		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate(),
		)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
			date.getSeconds(),
		)}${timezone}`;
	};

	const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
	if (dateOnlyPattern.test(dateValue)) {
		const [year, month, day] = dateValue.split("-").map((part) => Number(part));
		const date = new Date(year, month - 1, day, 0, 0, 0, 0);
		return buildString(date);
	}

	const parsed = Date.parse(dateValue);
	if (Number.isNaN(parsed)) return "";
	return buildString(new Date(parsed));
}

type RawExpense = Partial<{
	id: string | number;
	categoryId: string | number;
	category_id: string | number;
	description: string;
	amount: string | number;
	date: string | number;
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
		return parseDateString(value);
	}

	return 0;
}

function normalizeExpense(raw: unknown): Expense {
	const data = (raw ?? {}) as RawExpense;
	const rawAmount = toNumber(data.amount);
	const amount =
		Number.isInteger(rawAmount) && rawAmount !== 0
			? rawAmount
			: Math.round(rawAmount * 100);

	return {
		id: Math.trunc(toNumber(data.id)),
		categoryId: Math.trunc(toNumber(data.categoryId ?? data.category_id ?? 0)),
		description: typeof data.description === "string" ? data.description : "",
		amount: amount,
		date: normalizeDateValue(data.date),
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

export function expensePayloadFromForm(
	event: FormEvent<HTMLFormElement>,
): ExpensePayload {
	const formData = newFormData(event);
	const categoryId = Number(formDataGet(formData, "categoryId"));
	const dateInput = formDataGet(formData, "date");
	const date = toRFC3339Local(dateInput);
	const amountInput = Number.parseFloat(formDataGet(formData, "amount"));
	const amount =
		Number.isNaN(amountInput) || !Number.isFinite(amountInput)
			? 0
			: Math.round(amountInput * 100);

	return {
		categoryId: Number.isNaN(categoryId) ? 0 : categoryId,
		description: formDataGet(formData, "description"),
		amount,
		date,
	};
}

export async function listExpenses(
	accessToken?: string,
	queryOptions?: QueryOptions,
): Promise<AppResponse<ExpenseList>> {
	const queryParam = queryOptions
		? `?query_options=${encodeURIComponent(JSON.stringify(queryOptions))}`
		: "";
	const response = await api.get<ExpenseList>(`/expenses${queryParam}`, {
		accessToken,
	});

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
			items: itemsRaw.map((item) => normalizeExpense(item)),
			perPage,
			page,
			rows,
		},
	};
}

export async function getExpense(
	id: string,
	accessToken?: string,
): Promise<AppResponse<Expense>> {
	const response = await api.get<Expense>(`/expenses/${id}`, { accessToken });

	return {
		...response,
		data: response.data ? normalizeExpense(response.data) : null,
	};
}

export async function createExpense(
	payload: ExpensePayload,
	accessToken?: string,
): Promise<AppResponse<Expense>> {
	const response = await api.post<Expense>("/expenses", {
		body: payload,
		accessToken,
	});

	return {
		...response,
		data: response.data ? normalizeExpense(response.data) : null,
	};
}

export async function updateExpense(
	id: string,
	payload: ExpensePayload,
	accessToken?: string,
): Promise<AppResponse<Expense>> {
	const response = await api.put<Expense>(`/expenses/${id}`, {
		body: payload,
		accessToken,
	});

	return {
		...response,
		data: response.data ? normalizeExpense(response.data) : null,
	};
}

export async function deleteExpense(
	id: string,
	accessToken?: string,
): Promise<AppResponse<null>> {
	return api.delete<null>(`/expenses/${id}`, { accessToken });
}

export async function createExpenseAction(
	event: FormEvent<HTMLFormElement>,
	accessToken?: string,
): Promise<FormAction<Expense>> {
	const payload = expensePayloadFromForm(event);

	try {
		const response = await createExpense(payload, accessToken);
		return { ...response, form: payload };
	} catch (e) {
		return {
			data: null,
			error: (e as Error)?.message,
			form: payload,
		};
	}
}

export async function updateExpenseAction(
	id: string,
	event: FormEvent<HTMLFormElement>,
	accessToken?: string,
): Promise<FormAction<Expense>> {
	const payload = expensePayloadFromForm(event);

	try {
		const response = await updateExpense(id, payload, accessToken);
		return { ...response, form: payload };
	} catch (e) {
		return {
			data: null,
			error: (e as Error)?.message,
			form: payload,
		};
	}
}
