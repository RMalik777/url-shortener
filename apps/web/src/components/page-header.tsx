/**
 * The single page-title treatment for every in-app page.
 *
 * Owning the `h1` here keeps one heading scale across the dashboard — pages should
 * not style their own title. `children` is the right-aligned action slot.
 */
export function PageHeader({
	title,
	description,
	children,
}: Readonly<{
	title: string;
	description?: React.ReactNode;
	children?: React.ReactNode;
}>) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div className="flex min-w-0 flex-col gap-1">
				<h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
				{description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
			</div>
			{children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
		</div>
	);
}
