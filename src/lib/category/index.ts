import { create } from "zustand";
import type { AppResponse } from "../fetch";
import api from "../fetch";

export type Category = {
	id: number;
	name: string;
	uid: string;
};

type CategoryStore = {
	categories: Category[];
	isLoading: boolean;
	loaded: boolean;
	error: string | null;
	fetchCategories: (
		accessToken?: string,
		force?: boolean,
	) => Promise<Category[]>;
	setCategories: (categories: Category[]) => void;
};

type RawCategory = Partial<{
	id: string | number;
	name: string;
	uid: string;
}>;

function normalizeCategory(raw: unknown): Category {
	const data = (raw ?? {}) as RawCategory;
	return {
		id: Number(data.id ?? 0),
		name: data.name ?? data.uid ?? "",
		uid: data.uid ?? String(data.id ?? ""),
	};
}

export async function listCategories(
	accessToken?: string,
): Promise<AppResponse<Category[]>> {
	return api.get<Category[]>("/categories", { accessToken });
}

export const useCategories = create<CategoryStore>((set, get) => ({
	categories: [],
	isLoading: false,
	loaded: false,
	error: null,
	setCategories: (categories) => set({ categories }),
	fetchCategories: async (accessToken?: string, force = false) => {
		if (!force && (get().loaded || get().isLoading)) {
			return get().categories;
		}

		set({ isLoading: true, error: null });

		try {
			const response = await listCategories(accessToken);
			if (response.error) {
				set({ error: response.error, isLoading: false });
				return [];
			}

			const categories = response.data?.map(normalizeCategory) ?? [];
			set({ categories, loaded: true, isLoading: false });
			return categories;
		} catch (e) {
			set({
				error: (e as Error)?.message ?? "Could not load categories",
				isLoading: false,
			});
			return [];
		}
	},
}));
