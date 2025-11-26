import type { FormEvent } from "react";
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
