import type { Category } from "@/lib/category";
import type { DateFilterValue } from "./useExpenseQueryOptions";

type ExpenseFiltersProps = {
	categories: Category[];
	categoryValue: string;
	dateValue: DateFilterValue;
	customStart: string;
	customEnd: string;
	onCategoryChange: (value: string) => void;
	onDateChange: (value: DateFilterValue) => void;
	onCustomDateChange: (start: string, end: string) => void;
	pagination: {
		currentPage: number;
		canGoPrev: boolean;
		canGoNext: boolean;
		onPrev: () => void;
		onNext: () => void;
		onReset: () => void;
	};
};

function ExpenseFilters({
	categories,
	categoryValue,
	dateValue,
	customStart,
	customEnd,
	onCategoryChange,
	onDateChange,
	onCustomDateChange,
	pagination,
}: ExpenseFiltersProps) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
			<div className="flex flex-wrap items-end gap-3">
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

				<div className="flex flex-col gap-1">
					<label
						htmlFor="filter-date"
						className="text-xs font-semibold uppercase tracking-wide text-slate-500"
					>
						Date filter
					</label>
					<select
						id="filter-date"
						value={dateValue}
						onChange={(e) => onDateChange(e.target.value as DateFilterValue)}
						className="w-48 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
					>
						<option value="thisMonth">This month</option>
						<option value="nextMonth">Next month</option>
						<option value="today">Today</option>
						<option value="last7">Last 7 days</option>
						<option value="lastMonth">Last month</option>
						<option value="sixMonths">Last 6 months</option>
						<option value="thisYear">This year (so far)</option>
						<option value="all">All dates</option>
						<option value="custom">Custom range</option>
					</select>
				</div>

				{dateValue === "custom" ? (
					<div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								From
							</span>
							<input
								type="date"
								value={customStart}
								onChange={(e) => onCustomDateChange(e.target.value, customEnd)}
								className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
							/>
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								To
							</span>
							<input
								type="date"
								value={customEnd}
								onChange={(e) =>
									onCustomDateChange(customStart, e.target.value)
								}
								className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
							/>
						</label>
					</div>
				) : null}
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

export default ExpenseFilters;
