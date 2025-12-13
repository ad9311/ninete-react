import type { FormEvent } from "react";
import type { Category } from "@/lib/category";
import type { Expense, ExpensePayload } from "@/lib/expense";

type NewExpenseFormProps = {
	defaultValues?: Partial<ExpensePayload> | Partial<Expense>;
	categories?: Category[];
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	submitLabel?: string;
	isSubmitting?: boolean;
};

function NewExpenseForm({
	defaultValues,
	categories = [],
	onSubmit,
	submitLabel = "Save expense",
	isSubmitting = false,
}: NewExpenseFormProps) {
	const dateValue = formatDateInput(defaultValues?.date);

	return (
		<form
			onSubmit={onSubmit}
			className="space-y-6 rounded-lg border border-slate-200 bg-white p-6"
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="categoryId"
						className="text-sm font-semibold text-slate-700"
					>
						Category
					</label>
					<select
						id="categoryId"
						name="categoryId"
						defaultValue={
							defaultValues?.categoryId !== undefined
								? String(defaultValues.categoryId)
								: ""
						}
						className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
					>
						<option value="">Select a category</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
					{categories.length === 0 ? (
						<p className="text-xs text-slate-500">
							No categories available yet.
						</p>
					) : null}
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="description"
						className="text-sm font-semibold text-slate-700"
					>
						Description
					</label>
					<input
						id="description"
						name="description"
						type="text"
						defaultValue={defaultValues?.description}
						className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						placeholder="What was this for?"
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="amount"
						className="text-sm font-semibold text-slate-700"
					>
						Amount
					</label>
					<div className="flex items-center gap-2">
						<span className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
							$
						</span>
						<input
							id="amount"
							name="amount"
							type="number"
							step="0.01"
							defaultValue={
								defaultValues?.amount !== undefined
									? (defaultValues.amount / 100).toFixed(2)
									: undefined
							}
							className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
							placeholder="0.00"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="date"
						className="text-sm font-semibold text-slate-700"
					>
						Date &amp; time
					</label>
					<input
						id="date"
						name="date"
						type="datetime-local"
						defaultValue={dateValue}
						step="1"
						className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
					/>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<button
					type="submit"
					disabled={isSubmitting}
					className="rounded-md border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
				>
					{isSubmitting ? "Saving..." : submitLabel}
				</button>
			</div>
		</form>
	);
}

export default NewExpenseForm;

function formatDateInput(value?: number | string): string {
	if (value === undefined || value === null) return "";

	const date =
		typeof value === "number" ? new Date(value * 1000) : new Date(value || "");

	if (Number.isNaN(date.getTime())) return "";

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
