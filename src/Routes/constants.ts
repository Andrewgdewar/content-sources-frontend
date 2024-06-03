export const REPOSITORIES_ROUTE = 'repositories';
export const POPULAR_REPOSITORIES_ROUTE = 'popular-repositories';
export const ADMIN_TASKS_ROUTE = 'admin-tasks';
export const TEMPLATES_ROUTE = 'templates';
export const TEMPLATE_DETAILS_ROUTE = `${TEMPLATES_ROUTE}/:templateUUID/details`;
export const EDIT_ROUTE = 'edit';
export const ADD_ROUTE = 'add';
export const DELETE_ROUTE = 'delete';

export type TabbedRouteItem = {
  title: string;
  route: string;
  Element: () => JSX.Element;
  ChildRoutes?: { path: string; Element: () => JSX.Element }[];
};
