export const REPOSITORIES_ROUTE = 'repositories';
export const POPULAR_REPOSITORIES_ROUTE = 'popular';
export const ADMIN_TASKS_ROUTE = 'admin-tasks';
export const TEMPLATES_ROUTE = 'templates';
export const CONTENT_ROUTE = 'content';
export const SNAPSHOTS_ROUTE = 'snapshots';
export const SYSTEMS_ROUTE = 'systems';
export const DETAILS_ROUTE = 'details';
export const PACKAGES_ROUTE = 'packages';
export const ADVISORIES_ROUTE = 'advisories';
export const EDIT_ROUTE = 'edit';
export const UPLOAD_ROUTE = 'upload';
export const ADD_ROUTE = 'add';
export const DELETE_ROUTE = 'delete';
// PATCH

export const PATCH_SYSTEMS_ROUTE = 'patch/systems/';
export const INVENTORY_WORKSPACES_ROUTE = 'inventory/workspaces';

export type TabbedRouteItem = {
  title: string;
  route: string;
  Element: () => JSX.Element;
  ChildRoutes?: { path: string; Element: () => JSX.Element }[];
};
