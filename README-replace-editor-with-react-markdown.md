# Replace Editor's Read-only Mode with React-Markdown

This PR replaces the MDXEditor's read-only implementation with the lighter-weight `react-markdown` package. This change makes the application more efficient when rendering markdown content that doesn't need editing capabilities.

## Changes

1. Added dependencies:

   - `react-markdown`: A dedicated React component for rendering markdown
   - `rehype-raw`: Plugin for rendering raw HTML in markdown (for backward compatibility)
   - `remark-gfm`: Plugin for GitHub Flavored Markdown support (tables, tasks, etc.)

2. Created a new `ReactMarkdown` component with:

   - Full support for GitHub Flavored Markdown
   - "Show More"/"Show Less" capability for truncated content
   - Proper handling of external links (open in new tab with security attributes)
   - Comprehensive styling matching our design system

3. Updated components to use the new implementation:
   - `ActivityFeedPostItem` now uses `ReactMarkdown` instead of `MarkdownEditor`
   - `TermsOfWebsitePage` uses the new component

## Benefits

- **Performance**:

  - Faster rendering with smaller bundle size
  - Reduced JavaScript execution time
  - No initialization of MDXEditor's complex editor features

- **User Experience**:

  - Proper external link handling (opens in new tab with security attributes)
  - Improved styling consistency and readability
  - Better markdown rendering with GitHub Flavored Markdown support

- **Maintainability**:
  - Focused API just for rendering (vs. the complex editor API)
  - Clear separation between editing and viewing markdown
  - Simpler component with fewer dependencies

## Implementation Details

- The `ReactMarkdown` component supports all the same features as the read-only mode of the previous editor
- Added custom components for each HTML element to ensure proper styling
- External links automatically open in new tabs with security attributes
- Truncation with "Show More"/"Show Less" functionality works the same as before
- Comprehensive SCSS styling matching our design system

## Future Work

- Replace other instances of read-only `MarkdownEditor` usage
- Add code syntax highlighting with `react-syntax-highlighter`
- Consider adding plugins for math equations, diagrams, etc.

## Testing

- Verified rendering of markdown in ActivityFeedPostItem
- Confirmed proper external link behavior
- Tested truncation and "Show More"/"Show Less" functionality
- Validated compatibility with GitHub Flavored Markdown features
