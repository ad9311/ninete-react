import type { AppResponse } from "./fetch";

export type FormAction<T> = AppResponse<T> & {
	form: Record<string, string | number>;
};

export function formDataGet(formData: FormData, key: string): string {
	return formData.get(key)?.toString() ?? "";
}
