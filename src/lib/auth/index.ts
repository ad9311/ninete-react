import { create } from "zustand";
import type { User } from "../user";

export type Auth = {
	user: User | null;
	isUserSignedIn: boolean;
	accessToken?: string;
	setSignedIn: (user: User, accessToken: string) => void;
	setSignedOut: () => void;
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
