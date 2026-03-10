import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { buttonVariants } from "@repo/ui/components/button";
import type { VariantProps } from "class-variance-authority";

export function CopyButton({
	value,
	label,
	className,
	variant = "ghost",
	size = "icon-xs",
	duration = 3000,
	...props
}: Readonly<
	{
		value: string;
		label: string;
		duration?: number;
	} & ButtonPrimitive.Props &
		VariantProps<typeof buttonVariants>
>) {
	const [clicked, setClicked] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

	const iconClass = "absolute duration-150 ease-out";
	const hiddenClass = "opacity-0 blur-xs";
	const visibleClass = "opacity-100 blur-none";

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return (
		<Button
			type="button"
			variant={variant}
			size={size}
			className={cn("relative", className)}
			onClick={() => {
				navigator.clipboard.writeText(value);
				setClicked(true);
				toast.success(`${label} copied to clipboard!`);
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
				timeoutRef.current = setTimeout(() => setClicked(false), duration);
			}}
			{...props}
		>
			<CheckIcon className={cn(iconClass, clicked ? visibleClass : hiddenClass)} />
			<CopyIcon className={cn(iconClass, clicked ? hiddenClass : visibleClass)} />
			<span className="sr-only">Copy {label}</span>
		</Button>
	);
}
