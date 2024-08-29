import {
  Bullseye,
  Button,
  Flex,
  FlexItem,
  Grid,
  Pagination,
  PaginationVariant,
  Spinner,
  TooltipPosition,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  IAction,
  Table /* data-codemods */,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  ThProps,
  Tr,
} from '@patternfly/react-table';
import { global_BackgroundColor_100, global_Color_400 } from '@patternfly/react-tokens';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import {
  ContentItem,
  FilterData,
  IntrospectRepositoryRequestItem,
  ContentOrigin,
} from 'services/Content/ContentApi';
import { SkeletonTable } from '@patternfly/react-component-groups';

import {
  useBulkDeleteContentItemMutate,
  useContentListQuery,
  useIntrospectRepositoryMutate,
  useTriggerSnapshot,
} from 'services/Content/ContentQueries';
import ContentListFilters from './components/ContentListFilters';
import Hide from 'components/Hide/Hide';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import { useQueryClient } from 'react-query';
import StatusIcon from './components/StatusIcon';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import PackageCount from './components/PackageCount';
import { useAppContext } from 'middleware/AppContext';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import dayjs from 'dayjs';
import ChangedArrows from './components/SnapshotListModal/components/ChangedArrows';
import { Outlet, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ADD_ROUTE, DELETE_ROUTE, EDIT_ROUTE } from 'Routes/constants';
import useArchVersion from 'Hooks/useArchVersion';
import UploadRepositoryLabel from 'components/UploadRepositoryLabel/UploadRepositoryLabel';

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContainer100Height: {
    composes: ['$mainContainer'], // This extends another class within this stylesheet
    minHeight: '100%',
  },
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px', // This is needed
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    minHeight: '68px',
  },
  invisible: {
    opacity: 0,
  },
  checkboxMinWidth: {
    minWidth: '45px!important',
  },
  snapshotInfoText: {
    color: global_Color_400.value,
    marginRight: '16px',
  },
  inline: {
    display: 'flex',
  },
  disabledButton: {
    pointerEvents: 'auto',
    cursor: 'default',
  },
  uploadIcon: {
    marginLeft: '8px',
  },
});

export const perPageKey = 'contentListPerPage';

const ContentListTable = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { rbac, features, contentOrigin, setContentOrigin } = useAppContext();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(-1);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');
  const [checkedRepositories, setCheckedRepositories] = useState<Set<string>>(new Set<string>());
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const {
    archesDisplay,
    versionDisplay,
    isLoading: repositoryParamsLoading,
    isError: repositoryParamsIsError,
    error: repositoryParamsError,
  } = useArchVersion();

  const isRedHatRepository = contentOrigin === ContentOrigin.REDHAT;

  const [filterData, setFilterData] = useState<FilterData>({
    searchQuery: '',
    versions: [],
    arches: [],
    statuses: [],
  });

  const setOriginAndSearchParams = (origin: ContentOrigin) => {
    if (!features?.snapshots?.accessible) return;
    setContentOrigin(origin);
    setUrlSearchParams(origin === ContentOrigin.CUSTOM ? {} : { origin });
  };

  useEffect(() => {
    if (
      contentOrigin === ContentOrigin.REDHAT ||
      urlSearchParams.get('origin') === ContentOrigin.REDHAT
    ) {
      setOriginAndSearchParams(ContentOrigin.REDHAT);
    }
  }, []);

  const clearFilters = () =>
    setFilterData({ searchQuery: '', versions: [], arches: [], statuses: [] });

  const notFiltered =
    !filterData.arches?.length &&
    filterData.searchQuery === '' &&
    !filterData.versions?.length &&
    !filterData.statuses?.length;

  const columnSortAttributes = [
    'name',
    'distribution_arch',
    'distribution_versions',
    'package_count',
    'last_introspection_time',
  ];

  const sortString = useMemo(
    () =>
      activeSortIndex === -1
        ? ''
        : columnSortAttributes[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

  const {
    isLoading,
    error,
    isError,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useContentListQuery(page, perPage, filterData, sortString, contentOrigin, true, polling);

  useEffect(() => {
    if (isError) {
      setPolling(false);
      setPollCount(0);
      return;
    }
    const containsPending = data?.data?.some(({ status }) => status === 'Pending' || status === '');
    if (polling && containsPending) {
      // Count each consecutive time polling occurs
      setPollCount(pollCount + 1);
    }
    if (polling && !containsPending) {
      // We were polling, but now the data is valid, we stop the count.
      setPollCount(0);
    }
    if (pollCount > 40) {
      // If polling occurs 40 times in a row, we stop it. Likely a data/kafka issue has occurred with the API.
      return setPolling(false);
    }
    // This sets the polling state based whether the data contains any "Pending" status
    return setPolling(containsPending);
  }, [data?.data]);

  const { mutateAsync: introspectRepository, isLoading: isIntrospecting } =
    useIntrospectRepositoryMutate(
      queryClient,
      page,
      perPage,
      contentOrigin,
      filterData,
      sortString,
    );

  const introspectRepoForUuid = (uuid: string): Promise<void> =>
    introspectRepository({ uuid: uuid, reset_count: true } as IntrospectRepositoryRequestItem);

  const { mutateAsync: triggerSnapshotMutation } = useTriggerSnapshot(queryClient);

  const triggerSnapshot = async (uuid: string): Promise<void> => {
    triggerSnapshotMutation(uuid);
  };

  const { isLoading: isDeletingItems } = useBulkDeleteContentItemMutate(
    queryClient,
    checkedRepositories,
    page,
    perPage,
    contentOrigin,
    filterData,
    sortString,
  );

  const triggerIntrospectionAndSnapshot = async (repoUuid: string): Promise<void> => {
    clearCheckedRepositories();
    await introspectRepoForUuid(repoUuid);
    await triggerSnapshot(repoUuid);
  };

  // Other update actions will be added to this later.
  const actionTakingPlace =
    isFetching || repositoryParamsLoading || isIntrospecting || isDeletingItems;

  const onSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    localStorage.setItem(perPageKey, newPerPage.toString());
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const sortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const columnHeaders = [
    'Name',
    'Architecture',
    'Versions',
    'Packages',
    'Last Introspection',
    'Status',
  ];

  const lastIntrospectionDisplay = (time?: string): string =>
    time === '' || time === undefined ? 'Never' : dayjs(time).fromNow();

  // Error is caught in the wrapper component
  if (isError) throw error;
  if (repositoryParamsIsError) throw repositoryParamsError;

  const {
    data: contentList = [],
    meta: { count = 0 },
  } = data;

  const rowActions = useCallback(
    (rowData: ContentItem): IAction[] =>
      isRedHatRepository
        ? features?.snapshots?.accessible
          ? [
              {
                isDisabled:
                  actionTakingPlace ||
                  !rowData.snapshot ||
                  !(rowData.snapshot && rowData.last_snapshot_uuid),
                title:
                  rowData.snapshot && rowData.last_snapshot_uuid
                    ? 'View all snapshots'
                    : 'No snapshots yet',
                onClick: () => {
                  navigate(`${rowData.uuid}/snapshots`);
                },
              },
            ]
          : []
        : [
            {
              isDisabled: actionTakingPlace || rowData?.status === 'Pending',
              title: 'Edit',
              onClick: () => {
                navigate(`${EDIT_ROUTE}?repoUUIDS=${rowData.uuid}`);
              },
            },
            ...(features?.snapshots?.accessible
              ? [
                  {
                    isDisabled: actionTakingPlace || !rowData.last_snapshot_uuid,
                    title: rowData.last_snapshot_uuid ? 'View all snapshots' : 'No snapshots yet',
                    onClick: () => {
                      navigate(`${rowData.uuid}/snapshots`);
                    },
                  },
                  ...(rowData.origin !== ContentOrigin.UPLOAD
                    ? [
                        {
                          id: 'actions-column-snapshot',
                          className:
                            actionTakingPlace || rowData?.status === 'Pending' || !rowData.snapshot
                              ? classes.disabledButton
                              : '',
                          isDisabled:
                            actionTakingPlace || rowData?.status === 'Pending' || !rowData.snapshot,
                          title: 'Trigger snapshot',
                          onClick: () => {
                            triggerIntrospectionAndSnapshot(rowData?.uuid);
                          },
                          tooltipProps: !rowData.snapshot
                            ? {
                                content: 'Snapshots disabled for this repository.',
                                position: TooltipPosition.left,
                                triggerRef: () =>
                                  document.getElementById('actions-column-snapshot') ||
                                  document.body,
                              }
                            : undefined,
                        },
                      ]
                    : []),
                ]
              : []),
            ...(!rowData?.snapshot
              ? [
                  {
                    isDisabled: actionTakingPlace || rowData?.status == 'Pending',
                    title: 'Introspect now',
                    onClick: () =>
                      introspectRepoForUuid(rowData?.uuid).then(clearCheckedRepositories),
                  },
                ]
              : []),
            { isSeparator: true },
            {
              title: 'Delete',
              onClick: () => navigate(`${DELETE_ROUTE}?repoUUID=${rowData.uuid}`),
            },
          ],
    [actionTakingPlace, checkedRepositories, isRedHatRepository],
  );

  const clearCheckedRepositories = () => setCheckedRepositories(new Set<string>());

  // Applied to all repos on current page
  const selectAllRepos = (_, checked: boolean) => {
    if (checked) {
      const newSet = new Set<string>(checkedRepositories);
      data.data.forEach((contentItem) => newSet.add(contentItem.uuid));
      setCheckedRepositories(newSet);
    } else {
      const newSet = new Set<string>(checkedRepositories);
      for (const contentItem of data.data) {
        newSet.delete(contentItem.uuid);
      }
      setCheckedRepositories(newSet);
    }
  };

  const atLeastOneRepoChecked = useMemo(() => checkedRepositories.size >= 1, [checkedRepositories]);

  const areAllReposSelected = useMemo(() => {
    let atLeastOneSelectedOnPage = false;
    const allSelectedOrPending = data.data.every((contentItem) => {
      if (checkedRepositories.has(contentItem.uuid)) {
        atLeastOneSelectedOnPage = true;
      }
      return checkedRepositories.has(contentItem.uuid);
    });
    // Returns false if all repos on current page are pending (none selected)
    return allSelectedOrPending && atLeastOneSelectedOnPage;
  }, [data, checkedRepositories]);

  const onSelectRepo = (uuid: string, value: boolean) => {
    const newSet = new Set<string>(checkedRepositories);
    if (value) {
      newSet.add(uuid);
    } else {
      newSet.delete(uuid);
    }
    setCheckedRepositories(newSet);
  };

  const itemName =
    contentOrigin === ContentOrigin.CUSTOM ? 'custom repositories' : 'Red Hat repositories';
  const notFilteredBody = 'To get started, create a custom repository';

  const countIsZero = count === 0;
  const showLoader = countIsZero && notFiltered && !isLoading;

  // If Red Hat repositories returns a 0 count
  if (notFiltered && countIsZero && !isFetching && contentOrigin === ContentOrigin.REDHAT) {
    throw new Error('Unable to load Red Hat repositories');
  }

  const showPendingTooltip = (
    snapshotStatus: string | undefined,
    introspectStatus: string | undefined,
  ) => {
    if (!snapshotStatus && !introspectStatus) {
      return 'Introspection or snapshotting is in progress';
    } else if (snapshotStatus === 'running' || snapshotStatus === 'pending') {
      return 'Snapshotting is in progress';
    } else if (introspectStatus === 'Pending') {
      return 'Introspection is in progress';
    }
  };

  return (
    <>
      <Outlet
        context={{
          clearCheckedRepositories,
          deletionContext: {
            page,
            perPage,
            filterData,
            contentOrigin,
            sortString: sortString,
            checkedRepositories,
          },
        }}
      />
      <Grid
        data-ouia-component-id='content_list_page'
        className={countIsZero ? classes.mainContainer100Height : classes.mainContainer}
      >
        <Flex className={classes.topContainer}>
          <ContentListFilters
            contentOrigin={contentOrigin}
            setContentOrigin={setOriginAndSearchParams}
            isLoading={isLoading}
            setFilterData={(values) => {
              setFilterData(values);
              setPage(1);
            }}
            filterData={filterData}
            atLeastOneRepoChecked={atLeastOneRepoChecked}
            numberOfReposChecked={checkedRepositories.size}
          />
          <FlexItem>
            <Pagination
              id='top-pagination-id'
              widgetId='topPaginationWidgetId'
              isDisabled={isLoading}
              itemCount={count}
              perPage={perPage}
              page={page}
              onSetPage={onSetPage}
              isCompact
              onPerPageSelect={onPerPageSelect}
            />
          </FlexItem>
        </Flex>
        {showLoader ? (
          <Bullseye data-ouia-component-id='content_list_page'>
            <EmptyTableState
              notFiltered={notFiltered}
              clearFilters={clearFilters}
              itemName={itemName}
              notFilteredBody={notFilteredBody}
              notFilteredButton={
                <ConditionalTooltip
                  content='You do not have the required permissions to perform this action.'
                  show={!rbac?.repoWrite}
                  setDisabled
                >
                  <Button
                    id='createContentSourceButton'
                    ouiaId='create_content_source'
                    variant='primary'
                    isDisabled={isLoading}
                    onClick={() => navigate(ADD_ROUTE)}
                  >
                    Add repositories
                  </Button>
                </ConditionalTooltip>
              }
            />
          </Bullseye>
        ) : (
          <>
            <Hide hide={!isLoading}>
              <Grid className={classes.mainContainer}>
                <SkeletonTable
                  rows={perPage}
                  numberOfColumns={columnHeaders.length}
                  variant={TableVariant.compact}
                />
              </Grid>
            </Hide>
            <Hide hide={countIsZero || isLoading}>
              <>
                <Table
                  aria-label='Custom repositories table'
                  ouiaId='custom_repositories_table'
                  variant='compact'
                >
                  <Thead>
                    <Tr>
                      <Hide hide={!rbac?.repoWrite || isRedHatRepository}>
                        <Th
                          aria-label='select-repo-checkbox'
                          className={classes.checkboxMinWidth}
                          select={{
                            onSelect: selectAllRepos,
                            isSelected: areAllReposSelected,
                          }}
                        />
                      </Hide>
                      {columnHeaders.map((columnHeader, index) =>
                        columnHeader === 'Status' ? (
                          <Th key={columnHeader + 'column'}>{columnHeader}</Th>
                        ) : (
                          <Th key={columnHeader + 'column'} sort={sortParams(index)}>
                            {columnHeader}
                          </Th>
                        ),
                      )}
                      <Th aria-label='loading-spinner'>
                        <Spinner size='md' className={actionTakingPlace ? '' : classes.invisible} />
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {contentList.map((rowData: ContentItem, index) => {
                      const {
                        uuid,
                        name,
                        url,
                        last_snapshot,
                        distribution_arch,
                        distribution_versions,
                        last_introspection_time,
                        status,
                        origin,
                      } = rowData;
                      return (
                        <Tr key={uuid + status}>
                          <Hide hide={!rbac?.repoWrite || isRedHatRepository}>
                            <Td
                              select={{
                                rowIndex: index,
                                onSelect: (_event, isSelecting) =>
                                  onSelectRepo(rowData.uuid, isSelecting),
                                isSelected: checkedRepositories.has(rowData.uuid),
                              }}
                            />
                          </Hide>
                          <Td>
                            {name}
                            <Hide hide={origin !== ContentOrigin.UPLOAD}>
                              <UploadRepositoryLabel />
                            </Hide>
                            <Hide hide={origin === ContentOrigin.UPLOAD}>
                              <UrlWithExternalIcon href={url} />
                            </Hide>
                            <Hide hide={!features?.snapshots?.accessible}>
                              <Flex>
                                <FlexItem className={classes.snapshotInfoText}>
                                  {last_snapshot
                                    ? `Last snapshot ${dayjs(last_snapshot?.created_at).fromNow()}`
                                    : 'No snapshot yet'}
                                </FlexItem>
                                <Hide hide={!last_snapshot}>
                                  <FlexItem className={classes.inline}>
                                    <FlexItem className={classes.snapshotInfoText}>
                                      Changes:
                                    </FlexItem>
                                    <ChangedArrows
                                      addedCount={last_snapshot?.added_counts?.['rpm.package'] || 0}
                                      removedCount={
                                        last_snapshot?.removed_counts?.['rpm.package'] || 0
                                      }
                                    />
                                  </FlexItem>
                                </Hide>
                              </Flex>
                            </Hide>
                          </Td>
                          <Td>{archesDisplay(distribution_arch)}</Td>
                          <Td>{versionDisplay(distribution_versions)}</Td>
                          <Td>
                            <PackageCount rowData={rowData} />
                          </Td>
                          <Td>{lastIntrospectionDisplay(last_introspection_time)}</Td>
                          <Td>
                            <StatusIcon rowData={rowData} retryHandler={introspectRepoForUuid} />
                          </Td>
                          <Hide hide={!rowActions(rowData)?.length}>
                            <Td isActionCell>
                              <ConditionalTooltip
                                content={
                                  rowData?.status == 'Pending'
                                    ? showPendingTooltip(
                                        rowData?.last_snapshot_task?.status,
                                        rowData.status,
                                      )
                                    : 'You do not have the required permissions to perform this action.'
                                }
                                show={!isRedHatRepository && !rbac?.repoWrite}
                                setDisabled
                              >
                                <ActionsColumn items={rowActions(rowData)} />
                              </ConditionalTooltip>
                            </Td>
                          </Hide>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                <Flex className={classes.bottomContainer}>
                  <FlexItem />
                  <FlexItem>
                    <Pagination
                      id='bottom-pagination-id'
                      widgetId='bottomPaginationWidgetId'
                      itemCount={count}
                      perPage={perPage}
                      page={page}
                      onSetPage={onSetPage}
                      variant={PaginationVariant.bottom}
                      onPerPageSelect={onPerPageSelect}
                    />
                  </FlexItem>
                </Flex>
              </>
            </Hide>
            <Hide hide={!countIsZero || isLoading}>
              <EmptyTableState
                notFiltered={notFiltered}
                clearFilters={clearFilters}
                itemName={itemName}
                notFilteredBody={notFilteredBody}
                notFilteredButton={
                  <ConditionalTooltip
                    content='You do not have the required permissions to perform this action.'
                    show={!rbac?.repoWrite}
                    setDisabled
                  >
                    <Button
                      id='createContentSourceButton'
                      ouiaId='create_content_source'
                      variant='primary'
                      isDisabled={isLoading}
                      onClick={() => navigate(ADD_ROUTE)}
                    >
                      Add repositories
                    </Button>
                  </ConditionalTooltip>
                }
              />
            </Hide>
          </>
        )}
      </Grid>
    </>
  );
};

export const useContentListOutletContext = () =>
  useOutletContext<{
    clearCheckedRepositories: () => void;
    deletionContext: {
      page: number;
      perPage: number;
      filterData: FilterData;
      contentOrigin: ContentOrigin;
      sortString: string;
      checkedRepositories: Set<string>;
    };
  }>();

export default ContentListTable;
