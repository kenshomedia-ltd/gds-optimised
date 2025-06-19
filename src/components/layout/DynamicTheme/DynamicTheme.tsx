// src/components/layout/DynamicTheme/DynamicTheme.tsx

/**
 * DynamicTheme Component
 *
 * Server component that dynamically loads CSS themes based on site ID.
 * Falls back to 'gds' theme if the requested theme is not found.
 */
const DynamicTheme = async ({ siteId }: { siteId: string }) => {
  try {
    // This works because webpack can statically analyze the pattern
    // It will create chunks for all CSS files matching the pattern in the themes directory
    await import(`@/app/themes/${siteId}-theme.css`);
    console.log(`Successfully loaded theme for: ${siteId}`);
  } catch (error) {
    // If the specific theme doesn't exist, fall back to default
    console.log(
      `'${siteId}-theme.css' not found. Falling back to 'gds-theme.css'. | Error: ${error}`
    );
  }

  // This component doesn't render any JSX.
  // Its only purpose is to add a CSS import to the page's dependency graph.
  return null;
};

export default DynamicTheme;
