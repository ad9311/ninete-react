import { create } from "zustand";
import { type FormAction, formDataGet } from "..";
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
	setSignedOut: () => set({ user: null, isUserSignedIn: false }),
}));

export async function signInAction(
	initState: FormAction<AuthResponse>,
	formData: FormData,
) {
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
		return { ...initState, error: (e as Error)?.message, form: { email } };
	}
}
