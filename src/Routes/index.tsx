import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';

import { ErrorPage } from 'components/Error/ErrorPage';
import RepositoryLayout from '../Pages/Repositories/RepositoryLayout';
import { ZeroState } from 'components/ZeroState/ZeroState';
import {
  ADD_ROUTE,
  ADMIN_TASKS_ROUTE,
  ADVISORIES_ROUTE,
  CONTENT_ROUTE,
  DELETE_ROUTE,
  DETAILS_ROUTE,
  EDIT_ROUTE,
  PACKAGES_ROUTE,
  POPULAR_REPOSITORIES_ROUTE,
  REPOSITORIES_ROUTE,
  SNAPSHOTS_ROUTE,
  SYSTEMS_ROUTE,
  TEMPLATES_ROUTE,
  UPLOAD_ROUTE,
} from './constants';
import { useAppContext } from 'middleware/AppContext';
import TemplateDetails from 'Pages/Templates/TemplateDetails/TemplateDetails';
import { AddTemplate } from 'Pages/Templates/TemplatesTable/components/AddTemplate/AddTemplate';
import TemplatesTable from 'Pages/Templates/TemplatesTable/TemplatesTable';
import { NoPermissionsPage } from 'components/NoPermissionsPage/NoPermissionsPage';
import AddSystemModal from 'Pages/Templates/TemplateDetails/components/AddSystems/AddSystemModal';
import TemplateErrataTab from 'Pages/Templates/TemplateDetails/components/Tabs/TemplateErrataTab';
import TemplateSystemsTab from 'Pages/Templates/TemplateDetails/components/Tabs/TemplateSystemsTab';
import TemplatePackageTab from 'Pages/Templates/TemplateDetails/components/Tabs/TemplatePackageTab';
import ContentListTable from 'Pages/Repositories/ContentListTable/ContentListTable';
import AddContent from 'Pages/Repositories/ContentListTable/components/AddContent/AddContent';
import DeleteContentModal from 'Pages/Repositories/ContentListTable/components/DeleteContentModal/DeleteContentModal';
import SnapshotListModal from 'Pages/Repositories/ContentListTable/components/SnapshotListModal/SnapshotListModal';
import SnapshotDetailsModal from 'Pages/Repositories/ContentListTable/components/SnapshotDetailsModal/SnapshotDetailsModal';
import PackageModal from 'Pages/Repositories/ContentListTable/components/PackageModal/PackageModal';
import PopularRepositoriesTable from 'Pages/Repositories/PopularRepositoriesTable/PopularRepositoriesTable';
import AdminTaskTable from 'Pages/Repositories/AdminTaskTable/AdminTaskTable';
import ViewPayloadModal from 'Pages/Repositories/AdminTaskTable/components/ViewPayloadModal/ViewPayloadModal';
import UploadContent from 'Pages/Repositories/ContentListTable/components/UploadContent/UploadContent';

export default function RepositoriesRoutes() {
  const key = useMemo(() => Math.random(), []);
  const { zeroState, features, rbac } = useAppContext();
  return (
    <ErrorPage>
      <Routes key={key}>
        {zeroState ? <Route index path={REPOSITORIES_ROUTE} element={<ZeroState />} /> : <></>}
        <Route path={REPOSITORIES_ROUTE} element={<RepositoryLayout />}>
          <Route path='' element={<ContentListTable />}>
            {rbac?.repoWrite ? (
              <>
                <Route key={ADD_ROUTE} path={ADD_ROUTE} element={<AddContent />} />
                <Route
                  key={EDIT_ROUTE}
                  path={`:repoUUID/${EDIT_ROUTE}`}
                  element={<AddContent isEdit />}
                />
                <Route
                  key={UPLOAD_ROUTE}
                  path={`:repoUUID/${UPLOAD_ROUTE}`}
                  element={<UploadContent />}
                />
                <Route key={DELETE_ROUTE} path={DELETE_ROUTE} element={<DeleteContentModal />} />
              </>
            ) : (
              ''
            )}
            {features?.snapshots?.enabled && features.snapshots?.accessible ? (
              <>
                <Route
                  key={`:repoUUID/${SNAPSHOTS_ROUTE}`}
                  path={`:repoUUID/${SNAPSHOTS_ROUTE}`}
                  element={<SnapshotListModal />}
                />
                <Route
                  key={`:repoUUID/${SNAPSHOTS_ROUTE}/:snapshotUUID`}
                  path={`:repoUUID/${SNAPSHOTS_ROUTE}/:snapshotUUID`}
                  element={<SnapshotDetailsModal />}
                />
              </>
            ) : (
              ''
            )}
            <Route
              key={`:repoUUID/${PACKAGES_ROUTE}`}
              path={`:repoUUID/${PACKAGES_ROUTE}`}
              element={<PackageModal />}
            />
          </Route>
          <Route path={POPULAR_REPOSITORIES_ROUTE} element={<PopularRepositoriesTable />}>
            {rbac?.repoWrite ? (
              <Route key={DELETE_ROUTE} path={DELETE_ROUTE} element={<DeleteContentModal />} />
            ) : (
              ''
            )}
          </Route>
          {features?.admintasks?.enabled && features.admintasks?.accessible ? (
            <Route path={ADMIN_TASKS_ROUTE} element={<AdminTaskTable />}>
              <Route key=':taskUUID' path=':taskUUID' element={<ViewPayloadModal />} />
            </Route>
          ) : (
            ''
          )}
        </Route>
        {!rbac?.templateRead ? (
          <Route path={TEMPLATES_ROUTE} element={<NoPermissionsPage />} />
        ) : (
          ''
        )}
        <Route
          path={`${TEMPLATES_ROUTE}/:templateUUID/${DETAILS_ROUTE}`}
          element={<TemplateDetails />}
        >
          <Route path='' element={<Navigate to={`${CONTENT_ROUTE}/${PACKAGES_ROUTE}`} replace />} />
          <Route path={CONTENT_ROUTE}>
            <Route path='' element={<Navigate to={PACKAGES_ROUTE} replace />} />
            <Route path={PACKAGES_ROUTE} element={<TemplatePackageTab />} />
            <Route path={ADVISORIES_ROUTE} element={<TemplateErrataTab />} />
            <Route path='*' element={<Navigate to={PACKAGES_ROUTE} replace />} />
          </Route>
          <Route path={SYSTEMS_ROUTE} element={<TemplateSystemsTab />}>
            {rbac?.templateWrite ? <Route path={ADD_ROUTE} element={<AddSystemModal />} /> : ''}
          </Route>
          <Route path='*' element={<Navigate to={TEMPLATES_ROUTE} replace />} />
        </Route>
        <Route path={TEMPLATES_ROUTE} element={<TemplatesTable />}>
          {rbac?.templateWrite ? (
            <>
              <Route key='1' path={ADD_ROUTE} element={<AddTemplate />} />
              <Route key='2' path={`:templateUUID/${EDIT_ROUTE}`} element={<AddTemplate />} />
            </>
          ) : (
            ''
          )}
          <Route path='*' element={<Navigate to='' replace />} />
        </Route>
        <Route path='*' element={<Navigate to={REPOSITORIES_ROUTE} replace />} />
      </Routes>
    </ErrorPage>
  );
}
