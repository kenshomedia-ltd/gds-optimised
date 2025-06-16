// src/types/quicklinks.types.ts

/**
 * Props for the QuicklinksCollapsible component
 */
export interface QuicklinksCollapsibleProps {
  /**
   * ID for the collapsible element
   * @default "quicklinks"
   */
  id?: string;

  /**
   * Label for the collapsible header
   * @default "Link Rapidi"
   */
  label?: string;

  /**
   * Additional CSS classes for the container
   */
  containerClass?: string;

  /**
   * Additional CSS classes for the label/header
   */
  labelClass?: string;

  /**
   * Additional CSS classes for the content area
   */
  contentClass?: string;

  /**
   * Whether the collapsible should be open by default
   * @default true
   */
  defaultOpen?: boolean;
}

/**
 * Represents a heading extracted from the page
 */
export interface ExtractedHeading {
  /**
   * The text content of the heading
   */
  text: string;

  /**
   * The ID of the heading element
   */
  id: string;
}
