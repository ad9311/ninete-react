import { useEffect } from "react";
import { useAlert } from "@/lib";

export function Alert() {
	const { alert, clearAlert } = useAlert();

	useEffect(() => {
		if (!alert) return;

		const timer = setTimeout(() => {
			clearAlert();
		}, 5000);

		return () => clearTimeout(timer);
	}, [alert, clearAlert]);

	if (!alert) return null;

	return (
		<div role="alert">
			<span>{alert.message}</span>
			<button type="button" onClick={clearAlert}>
				X
			</button>
		</div>
	);
}
