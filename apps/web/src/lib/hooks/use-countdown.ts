import { useCallback, useEffect, useState } from "react";

/**
 * Counts down to zero, one second at a time.
 *
 * Used to hold destructive confirm buttons disabled briefly. The timer lives in an
 * effect, so it clears itself on unmount and whenever the dialog is dismissed early.
 */
export function useCountdown(seconds: number) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (count <= 0) {
			return;
		}
		const timer = setTimeout(() => setCount((current) => current - 1), 1000);
		return () => clearTimeout(timer);
	}, [count]);

	const start = useCallback(() => setCount(seconds), [seconds]);
	const reset = useCallback(() => setCount(0), []);

	return { count, active: count > 0, start, reset };
}
