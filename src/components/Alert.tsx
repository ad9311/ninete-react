import { useEffect } from "react";
import { useAlert } from "@/lib";

export function Alert() {
	const { alert, clearAlert } = useAlert();
	const isError = alert?.type === "error";

	useEffect(() => {
		if (!alert) return;

		const timer = setTimeout(() => {
			clearAlert();
		}, 5000);

		return () => clearTimeout(timer);
	}, [alert, clearAlert]);

	if (!alert) return null;

	return (
		<div
			role="alert"
			className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${
				isError
					? "border-red-200 bg-red-50 text-red-800"
					: "border-blue-200 bg-blue-50 text-blue-800"
			}`}
		>
			<div
				className={`h-2 w-2 rounded-full ${
					isError ? "bg-red-500" : "bg-blue-600"
				}`}
			/>
			<span className="max-w-xs font-semibold">{alert.message}</span>
			<button
				type="button"
				onClick={clearAlert}
				className="ml-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-700"
				aria-label="Close alert"
			>
				Close
			</button>
		</div>
	);
}
