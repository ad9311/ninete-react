import type { FormEvent } from "react";
import { create } from "zustand";
import { type FormAction, formDataGet, newFormData } from "..";
import api from "../fetch";
import type { User } from "../user";

export type Auth = {
	user: User | null;
	isUserSignedIn: boolean;
	accessToken?: string;
	setSignedIn: (user: User, accessToken: string) => void;
	setSignedOut: () => void;
};

export type AuthResponse = {
	user: User;
	accessToken: {
		value: string;
		expiresAt: number;
		issuedAt: number;
	};
};

const initState = {
	user: null,
	isUserSignedIn: false,
};

export const useAuth = create<Auth>((set) => ({
	...initState,
	setSignedIn: (user: User, accessToken: string) =>
		set({ user, accessToken, isUserSignedIn: true }),
	setSignedOut: () =>
		set({ user: null, accessToken: undefined, isUserSignedIn: false }),
}));

export async function signInAction(
	event: FormEvent<HTMLFormElement>,
): Promise<FormAction<AuthResponse>> {
	const formData = newFormData(event);
	const email = formDataGet(formData, "email");
	const password = formDataGet(formData, "password");

	try {
		const body = {
			email,
			password,
		};

		const response = await api.post<AuthResponse>("/auth/sign-in", { body });
		return { ...response, form: { email } };
	} catch (e) {
		return { data: null, error: (e as Error)?.message, form: { email } };
	}
}
