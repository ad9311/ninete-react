import type { FormEvent } from "react";
import type { Category } from "@/lib/category";
import type {
	RecurrentExpense,
	RecurrentExpensePayload,
} from "@/lib/recurrent-expense";

type NewRecurrentExpenseFormProps = {
	defaultValues?: Partial<RecurrentExpensePayload> | Partial<RecurrentExpense>;
	categories?: Category[];
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	submitLabel?: string;
	isSubmitting?: boolean;
};

function NewRecurrentExpenseForm({
	defaultValues,
	categories = [],
	onSubmit,
	submitLabel = "Save recurrent expense",
	isSubmitting = false,
}: NewRecurrentExpenseFormProps) {
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
						placeholder="What is this for?"
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
						htmlFor="period"
						className="text-sm font-semibold text-slate-700"
					>
						Period (months)
					</label>
					<input
						id="period"
						name="period"
						type="number"
						min={1}
						step={1}
						defaultValue={
							defaultValues?.period !== undefined ? defaultValues.period : 1
						}
						className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
						placeholder="1"
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

export default NewRecurrentExpenseForm;
