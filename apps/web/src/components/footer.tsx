export function Footer() {
	return (
		<footer className="flex flex-col items-center justify-center bg-foreground p-4 text-center text-sm text-background">
			<p>&copy; {new Date().getFullYear()} Rafli Malik</p>
			<a href="https://github.com/RMalik777/url-shortener/blob/main/LICENSE">
				Licensed under AGPL v3.0
			</a>
		</footer>
	);
}
