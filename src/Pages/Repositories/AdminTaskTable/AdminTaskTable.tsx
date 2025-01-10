import {
  Bullseye,
  Button,
  Flex,
  FlexItem,
  Grid,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import {
  Table /* data-codemods */,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  ThProps,
  Tr,
} from '@patternfly/react-table';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { SkeletonTable } from '@patternfly/react-component-groups';
import Hide from 'components/Hide/Hide';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import AdminTaskFilters from './components/AdminTaskFilters';
import StatusIcon from './components/StatusIcon';
import { useAdminTaskListQuery } from 'services/AdminTasks/AdminTaskQueries';
import { AdminTaskFilterData, AdminTask } from 'services/AdminTasks/AdminTaskApi';
import { Outlet, useNavigate } from 'react-router-dom';
import { formatDateDDMMMYYYY } from 'helpers';

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
});

const perPageKey = 'adminTaskPerPage';

const AdminTaskTable = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(3); // queued_at
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('desc');

  const [filterData, setFilterData] = useState<AdminTaskFilterData>({
    accountId: '',
    orgId: '',
    statuses: [],
    typenames: [],
  });

  const clearFilters = () =>
    setFilterData({ statuses: [], accountId: '', orgId: '', typenames: [] });

  const notFiltered =
    filterData.typenames?.length === 0 &&
    filterData.statuses?.length === 0 &&
    filterData.accountId === '' &&
    filterData.orgId === '';

  const columnSortAttributes = ['org_id', 'account_id', 'typename', 'queued_at', 'status'];

  const sortString = useMemo(
    () => columnSortAttributes[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

  const {
    isLoading,
    error,
    isError,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useAdminTaskListQuery(page, perPage, filterData, sortString, polling);

  useEffect(() => {
    if (isError) {
      setPolling(false);
      setPollCount(0);
      return;
    }
    const containsPending = data?.data?.some(
      ({ status }) => status === 'pending' || status === 'running',
    );
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
  }, [data.data]);

  const actionTakingPlace = isFetching;

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

  const columnHeaders = ['Org ID', 'Account ID', 'Type', 'Queued At', 'Status'];

  // Error is caught in the wrapper component
  if (isError) throw error;

  const {
    data: adminTaskList = [],
    meta: { count = 0 },
  } = data;

  const itemName = 'tasks';
  const notFilteredBody = 'Certain actions, such as repository introspection, will start a task';

  const countIsZero = count === 0;

  if (countIsZero && notFiltered && !isLoading)
    return (
      <Bullseye data-ouia-component-id='admin_task_list_page'>
        <EmptyTableState
          notFiltered={notFiltered}
          clearFilters={clearFilters}
          itemName={itemName}
          notFilteredBody={notFilteredBody}
        />
      </Bullseye>
    );

  return (
    <Grid
      data-ouia-component-id='admin_task_list_page'
      className={countIsZero ? classes.mainContainer100Height : classes.mainContainer}
    >
      <Outlet />
      <Flex className={classes.topContainer}>
        <AdminTaskFilters
          isLoading={isLoading}
          setFilterData={(values) => {
            setFilterData(values);
            setPage(1);
          }}
          filterData={filterData}
        />
        <FlexItem>
          <Hide hide={countIsZero}>
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
          </Hide>
        </FlexItem>
      </Flex>
      <Hide hide={!isLoading}>
        <Grid className={classes.mainContainer}>
          <SkeletonTable
            rows={perPage}
            columnsCount={columnHeaders.length}
            variant={TableVariant.compact}
          />
        </Grid>
      </Hide>
      <Hide hide={countIsZero || isLoading}>
        <>
          <Table aria-label='Admin tasks table' ouiaId='admin_tasks_table' variant='compact'>
            <Thead>
              <Tr>
                {columnHeaders.map((columnHeader, index) => (
                  <Th key={columnHeader + 'column'} sort={sortParams(index)}>
                    {columnHeader}
                  </Th>
                ))}
                <Th>
                  <Spinner size='md' className={actionTakingPlace ? '' : classes.invisible} />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {adminTaskList.map((adminTask: AdminTask, index) => (
                <Tr key={adminTask.uuid + index + ''}>
                  <Td>{adminTask.org_id}</Td>
                  <Td>{adminTask.account_id ? adminTask.account_id : 'Unknown'}</Td>
                  <Td>{adminTask.typename}</Td>
                  <Td>{formatDateDDMMMYYYY(adminTask.queued_at, true)}</Td>
                  <Td>
                    <StatusIcon status={adminTask.status} />
                  </Td>
                  <Td width={10}>
                    <Button
                      onClick={() => navigate(adminTask.uuid)}
                      variant='secondary'
                      ouiaId='view_task_details'
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
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
        />
      </Hide>
    </Grid>
  );
};

export default AdminTaskTable;
