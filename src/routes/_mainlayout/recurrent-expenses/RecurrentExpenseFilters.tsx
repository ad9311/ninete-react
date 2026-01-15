import type { Category } from "@/lib/category";

type RecurrentExpenseFiltersProps = {
	categories: Category[];
	categoryValue: string;
	onCategoryChange: (value: string) => void;
	pagination: {
		currentPage: number;
		canGoPrev: boolean;
		canGoNext: boolean;
		onPrev: () => void;
		onNext: () => void;
		onReset: () => void;
	};
};

function RecurrentExpenseFilters({
	categories,
	categoryValue,
	onCategoryChange,
	pagination,
}: RecurrentExpenseFiltersProps) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
			<div className="flex flex-col gap-1">
				<label
					htmlFor="filter-category"
					className="text-xs font-semibold uppercase tracking-wide text-slate-500"
				>
					Category filter
				</label>
				<select
					id="filter-category"
					value={categoryValue}
					onChange={(e) => onCategoryChange(e.target.value)}
					className="w-48 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
				>
					<option value="">All categories</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
			</div>
			<div className="flex items-center gap-2 text-sm text-slate-600">
				<button
					type="button"
					onClick={pagination.onReset}
					className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
				>
					Reset page
				</button>
				<span className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
					Page {pagination.currentPage}
				</span>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={pagination.onPrev}
						disabled={!pagination.canGoPrev}
						className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Prev
					</button>
					<button
						type="button"
						onClick={pagination.onNext}
						disabled={!pagination.canGoNext}
						className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}

export default RecurrentExpenseFilters;
