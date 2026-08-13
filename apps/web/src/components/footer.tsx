const linkClass =
	"underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function Footer() {
	return (
		<footer className="flex flex-col items-center justify-center gap-1 bg-muted p-4 text-center text-sm">
			<p>
				&copy; {new Date().getFullYear()}{" "}
				<a
					className={linkClass}
					href="https://raflimalik.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					Rafli Malik
				</a>
			</p>
			<a
				className={`text-muted-foreground hover:text-foreground ${linkClass}`}
				target="_blank"
				rel="noopener noreferrer"
				href="https://github.com/RMalik777/url-shortener/blob/main/LICENSE"
			>
				Licensed under AGPL v3.0
			</a>
		</footer>
	);
}
