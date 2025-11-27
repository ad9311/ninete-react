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
	date: number;
};

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
		const parsed = Date.parse(value);
		if (Number.isNaN(parsed)) return 0;
		return Math.floor(parsed / 1000);
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

export function expensePayloadFromForm(
	event: FormEvent<HTMLFormElement>,
): ExpensePayload {
	const formData = newFormData(event);
	const categoryId = Number(formDataGet(formData, "categoryId"));
	const dateInput = formDataGet(formData, "date");
	const date = normalizeDateValue(dateInput);
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
): Promise<AppResponse<Expense[]>> {
	const response = await api.get<Expense[]>("/expenses", { accessToken });

	return {
		...response,
		data: response.data?.map(normalizeExpense) ?? [],
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
