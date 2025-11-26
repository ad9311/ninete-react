import type { FormEvent } from "react";
import { create } from "zustand";
import type { AppResponse } from "./fetch";

export type FormAction<T> = AppResponse<T> & {
	form: Record<string, string | number>;
};

export function newFormData(event: FormEvent): FormData {
	event.preventDefault();
	const form = event.target as HTMLFormElement;

	return new FormData(form);
}

export function formDataGet(formData: FormData, key: string): string {
	return formData.get(key)?.toString() ?? "";
}

export type AlertType = "error" | "success";

export type Alert = {
	message: string;
	type: AlertType;
};

export type AlertStore = {
	alert: Alert | null;
	setAlert: (message: string, type: AlertType) => void;
	clearAlert: () => void;
};

export const useAlert = create<AlertStore>((set) => ({
	alert: null,
	setAlert: (message, type) => set({ alert: { message, type } }),
	clearAlert: () => set({ alert: null }),
}));
