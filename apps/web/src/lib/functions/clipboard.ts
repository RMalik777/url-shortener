import { toast } from "sonner";

/**
 * Copies text and reports the outcome.
 *
 * For places that cannot host a `CopyButton` (dropdown menu items). Awaits the write
 * so a rejected clipboard permission surfaces an error instead of a success toast.
 */
export async function copyToClipboard(value: string, label: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(`${label} copied to clipboard`);
	} catch {
		toast.error(`Could not copy ${label}`);
	}
}
