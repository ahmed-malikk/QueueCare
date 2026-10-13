/**
 * Wraps every page. Unlike the layout, a template is re-created on each navigation, so the
 * page-enter animation plays whenever you open a page, but not when live data refreshes it.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
