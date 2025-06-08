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
