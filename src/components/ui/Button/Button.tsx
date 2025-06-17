// src/components/ui/Button/Button.tsx
"use client";

import React, { forwardRef } from "react"; // Import React
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";
import type { ButtonProps } from "@/types/button.types";

/**
 * Polymorphic Button Component
 *
 * A reusable component that can be rendered as a button or a Next.js Link.
 * It defaults to a <button> and renders as a <Link> if an `href` prop is provided.
 */
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    { className, variant = "default", size = "md", asChild = false, ...props },
    ref
  ) => {
    // Determine the component type
    const isLink = "href" in props && props.href !== undefined;

    // We use `as React.ElementType` to solve the complex type inference issue.
    const Comp = (
      asChild ? Slot : isLink ? Link : "button"
    ) as React.ElementType;

    const variants = {
      default: "",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8 text-lg",
    };

    // Note: The exclamation marks `!` are added to variant and size
    // because they have default values, so we know they won't be null.
    return (
      <Comp
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded",
          "text-secondary-text uppercase font-bold",
          "transition-colors whitespace-nowrap",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
          variants[variant!],
          sizes[size!],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
