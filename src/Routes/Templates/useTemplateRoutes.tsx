import { useMemo } from 'react';
import { useAppContext } from 'middleware/AppContext';
import {
  ADD_ROUTE,
  EDIT_ROUTE,
  TEMPLATES_ROUTE,
  TEMPLATE_DETAILS_ROUTE,
  TabbedRouteItem,
} from '../constants';
import TemplatesTable from '../../Pages/Templates/TemplatesTable/TemplatesTable';
import { AddTemplate } from '../../Pages/Templates/TemplatesTable/components/AddTemplate/AddTemplate';
import { NoPermissionsPage } from 'components/NoPermissionsPage/NoPermissionsPage';
import TemplateDetails from '../../Pages/Templates/TemplateDetails/TemplateDetails';

export default function useTemplateRoutes(): TabbedRouteItem[] {
  const { features, rbac, chrome } = useAppContext();
  const hasWrite = rbac?.templateWrite;

  // Wrap in a memo to prevent recalculation if values haven't changed.
  const tabs = useMemo(
    () =>
      chrome?.isProd()
        ? []
        : [
            {
              title: 'Templates',
              route: TEMPLATE_DETAILS_ROUTE,
              Element: TemplateDetails,
              ChildRoutes: [],
            },
            {
              title: 'Templates',
              route: TEMPLATES_ROUTE,
              Element: TemplatesTable,
              ChildRoutes: [
                ...(hasWrite // These child routes are only permitted with rbac?.write access
                  ? [
                      { path: ADD_ROUTE, Element: AddTemplate },
                      { path: `:templateUUID/${EDIT_ROUTE}`, Element: AddTemplate },
                    ]
                  : []),
              ],
            },
          ],
    [hasWrite, features],
  );

  if (!rbac?.templateRead) {
    return [
      {
        title: 'Templates',
        route: TEMPLATES_ROUTE,
        Element: () => <NoPermissionsPage />,
        ChildRoutes: [],
      },
    ];
  }

  return tabs;
}
