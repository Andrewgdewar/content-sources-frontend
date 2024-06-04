import { useMemo } from 'react';
import AdminTaskTable from '../../Pages/Repositories/AdminTaskTable/AdminTaskTable';
import ViewPayloadModal from '../../Pages/Repositories/AdminTaskTable/components/ViewPayloadModal/ViewPayloadModal';
import ContentListTable from '../../Pages/Repositories/ContentListTable/ContentListTable';
import AddContent from '../../Pages/Repositories/ContentListTable/components/AddContent/AddContent';
import EditContentModal from '../../Pages/Repositories/ContentListTable/components/EditContentModal/EditContentModal';
import DeleteContentModal from '../../Pages/Repositories/ContentListTable/components/DeleteContentModal/DeleteContentModal';
import PackageModal from '../../Pages/Repositories/ContentListTable/components/PackageModal/PackageModal';
import PopularRepositoriesTable from '../../Pages/Repositories/PopularRepositoriesTable/PopularRepositoriesTable';
import { useAppContext } from 'middleware/AppContext';
import SnapshotListModal from '../../Pages/Repositories/ContentListTable/components/SnapshotListModal/SnapshotListModal';
import {
  ADD_ROUTE,
  ADMIN_TASKS_ROUTE,
  DELETE_ROUTE,
  EDIT_ROUTE,
  POPULAR_REPOSITORIES_ROUTE,
  REPOSITORIES_ROUTE,
  TabbedRouteItem,
} from '../constants';
import SnapshotDetailsModal from '../../Pages/Repositories/ContentListTable/components/SnapshotDetailsModal/SnapshotDetailsModal';
import { NoPermissionsPage } from 'components/NoPermissionsPage/NoPermissionsPage';

export default function useRepositoryRoutes(): TabbedRouteItem[] {
  const { features, rbac } = useAppContext();
  const hasWrite = rbac?.repoWrite;

  // Wrap in a memo to prevent recalculation if values haven't changed.
  const tabs = useMemo(
    () => [
      {
        title: 'Your repositories',
        route: REPOSITORIES_ROUTE,
        Element: ContentListTable,
        ChildRoutes: [
          ...(hasWrite // These child routes are only permitted with rbac?.write access
            ? [
                { path: EDIT_ROUTE, Element: EditContentModal },
                { path: ADD_ROUTE, Element: AddContent },
                { path: DELETE_ROUTE, Element: DeleteContentModal },
              ]
            : []),
          ...(features?.snapshots?.enabled && features.snapshots?.accessible
            ? [
                { path: ':repoUUID/snapshots', Element: SnapshotListModal },
                { path: ':repoUUID/snapshots/:snapshotUUID', Element: SnapshotDetailsModal },
              ]
            : []),
          { path: ':repoUUID/packages', Element: PackageModal },
        ],
      },
      {
        title: 'Popular repositories',
        route: POPULAR_REPOSITORIES_ROUTE,
        Element: PopularRepositoriesTable,
      },
      ...(features?.admintasks?.enabled && features.admintasks?.accessible
        ? [
            {
              title: 'Admin tasks',
              route: ADMIN_TASKS_ROUTE,
              Element: AdminTaskTable,
              ChildRoutes: [{ path: ':taskUUID', Element: ViewPayloadModal }],
            },
          ]
        : []),
    ],
    [hasWrite, features],
  );

  if (!rbac?.repoRead) {
    return [
      {
        title: 'Your repositories',
        route: REPOSITORIES_ROUTE,
        Element: () => <NoPermissionsPage />,
        ChildRoutes: [],
      },
    ];
  }

  return tabs;
}
