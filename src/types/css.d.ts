// src/types/css.d.ts
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Also declare for specific theme files
declare module "@/app/themes/*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "csstype" {
  interface Properties {
    // FontAwesome custom properties
    "--fa-primary-opacity"?: number | string;
    "--fa-secondary-opacity"?: number | string;
    "--fa-primary-color"?: string;
    "--fa-secondary-color"?: string;

    // Add other custom properties your project uses
    [key: `--${string}`]: string | number | undefined;
  }
}

// Extend React's CSSProperties to ensure objectFit is recognized
declare module "react" {
  interface CSSProperties {
    objectFit?: import("csstype").Property.ObjectFit;
  }
}

// This line ensures the file is treated as a module and allows for module augmentation.
export {};
