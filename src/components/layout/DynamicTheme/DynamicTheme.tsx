// src/components/layout/DynamicTheme.tsx

// This is a server component, so this logic runs only on the server.
const DynamicTheme = async ({ siteId }: { siteId: string }) => {
  try {
    // Attempt to import the site-specific theme.
    // The '@' path alias should be configured in your tsconfig.json
    await import(`@/app/themes/${siteId}-theme.css`);
    console.log(`Successfully loaded theme for: ${siteId}`);
  } catch (error) {
    // If it fails (e.g., file not found), import the default theme.
    await import("@/app/themes/gds-theme.css");
    console.log(
      `'${siteId}-theme.css' not found. Fell back to 'gds-theme.css'. | Error: ${error}`
    );
  }

  // This component doesn't render any JSX. Its only purpose is to
  // add a CSS import to the page's dependency graph.
  return null;
};

export default DynamicTheme;
