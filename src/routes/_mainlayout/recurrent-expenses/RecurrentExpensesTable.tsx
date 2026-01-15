import { Link } from "@tanstack/react-router";
import type { QueryOptions, RecurrentExpense } from "@/lib/recurrent-expense";

type RecurrentExpensesTableProps = {
	items: RecurrentExpense[];
	sorting?: QueryOptions["sorting"];
	categoryLookup: Record<string, string>;
	onToggleSort: (field: string) => void;
	onDelete: (id: number) => void;
	isDeleting: boolean;
	formatCurrency: (amount: number) => string;
	formatDate: (value: number) => string;
};

type SortableHeaderProps = {
	field: string;
	label: string;
	sorting?: QueryOptions["sorting"];
	onToggle: (field: string) => void;
};

function SortableHeader({
	field,
	label,
	sorting,
	onToggle,
}: SortableHeaderProps) {
	const isActive = sorting?.field === field;
	const direction = sorting?.order === "desc" ? "↓" : "↑";

	return (
		<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
			<button
				type="button"
				onClick={() => onToggle(field)}
				className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700"
			>
				<span>{label}</span>
				{isActive ? <span>{direction}</span> : null}
			</button>
		</th>
	);
}

function RecurrentExpensesTable({
	items,
	sorting,
	categoryLookup,
	onToggleSort,
	onDelete,
	isDeleting,
	formatCurrency,
	formatDate,
}: RecurrentExpensesTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
			<div className="w-full overflow-x-auto">
				<table className="min-w-[720px] w-full divide-y divide-slate-200">
					<thead className="bg-slate-50">
						<tr>
							<SortableHeader
								field="category_id"
								label="Category"
								sorting={sorting}
								onToggle={onToggleSort}
							/>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
								Description
							</th>
							<SortableHeader
								field="amount"
								label="Amount"
								sorting={sorting}
								onToggle={onToggleSort}
							/>
							<SortableHeader
								field="period"
								label="Period"
								sorting={sorting}
								onToggle={onToggleSort}
							/>
							<SortableHeader
								field="last_copy_created"
								label="Last created"
								sorting={sorting}
								onToggle={onToggleSort}
							/>
							<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{items.map((expense) => (
							<tr key={expense.id} className="hover:bg-slate-50">
								<td className="px-4 py-3 text-sm font-semibold text-slate-800">
									{categoryLookup[String(expense.categoryId)] ??
										expense.categoryId}
								</td>
								<td className="px-4 py-3 text-sm text-slate-600">
									{expense.description || "—"}
								</td>
								<td className="px-4 py-3 text-sm font-semibold text-slate-900">
									{formatCurrency(expense.amount / 100)}
								</td>
								<td className="px-4 py-3 text-sm text-slate-600">
									Every {expense.period} month
									{expense.period === 1 ? "" : "s"}
								</td>
								<td className="px-4 py-3 text-sm text-slate-600">
									{expense.lastCopyCreated
										? formatDate(expense.lastCopyCreated)
										: "—"}
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center justify-end gap-2">
										<Link
											to="/recurrent-expenses/$recurrentExpenseId"
											params={{ recurrentExpenseId: String(expense.id) }}
											className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
										>
											Edit
										</Link>
										<button
											type="button"
											onClick={() => onDelete(expense.id)}
											disabled={isDeleting}
											className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{isDeleting ? "Deleting..." : "Delete"}
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default RecurrentExpensesTable;
