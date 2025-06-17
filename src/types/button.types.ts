// src/types/button.types.ts
import type { LinkProps } from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

// Define the shared props that both the button and link variants will have
interface BaseButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  asChild?: boolean; // Add asChild to the base props
}

// Create a union type that can be either a button or a link (<a> tag)
// This ensures that button-specific props are only available for buttons,
// and link-specific props (like href) are only available for links.
export type ButtonProps = BaseButtonProps &
  (
    | (ButtonHTMLAttributes<HTMLButtonElement> & {
        as?: "button"; // Explicitly a button
        href?: never; // A button should never have an href
      })
    | (AnchorHTMLAttributes<HTMLAnchorElement> &
        LinkProps & {
          // Include Next.js LinkProps
          as?: "a"; // Explicitly an anchor/link
          href: string; // A link MUST have an href
        })
  );
