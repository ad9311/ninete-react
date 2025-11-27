type LoadingProps = {
	label?: string;
	fullscreen?: boolean;
};

function Loading({ label = "Loading", fullscreen = false }: LoadingProps) {
	return (
		<div
			className={`${
				fullscreen
					? "flex min-h-screen items-center justify-center"
					: "flex items-center justify-center py-12"
			}`}
		>
			<div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700">
				<span className="h-6 w-6 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
				<span className="text-sm font-semibold uppercase tracking-wide">
					{label}
				</span>
			</div>
		</div>
	);
}

export default Loading;
