export function Footer() {
	return (
		<footer className="flex flex-col items-center justify-center bg-muted p-4 text-center text-sm">
			<p>
				&copy; {new Date().getFullYear()}{" "}
				<a href="http://raflimalik.com" target="_blank" rel="noopener noreferrer">
					Rafli Malik
				</a>
			</p>
			<a
				className="text-muted-foreground hover:text-foreground hover:underline"
				target="_blank"
				rel="noopener noreferrer"
				href="https://github.com/RMalik777/url-shortener/blob/main/LICENSE"
			>
				Licensed under AGPL v3.0
			</a>
		</footer>
	);
}
