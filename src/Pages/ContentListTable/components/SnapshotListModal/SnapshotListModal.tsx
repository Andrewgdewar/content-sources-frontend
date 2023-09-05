import {
  Button,
  Flex,
  FlexItem,
  Grid,
  Modal,
  ModalVariant,
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import {
  InnerScrollContainer,
  TableComposable,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  ThProps,
  Tr,
} from '@patternfly/react-table';
import {
  global_BackgroundColor_100,
  global_secondary_color_100,
  global_Color_200,
} from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import Hide from '../../../../components/Hide/Hide';
import { SnapshotItem } from '../../../../services/Content/ContentApi';
import { useFetchContent, useGetSnapshotList } from '../../../../services/Content/ContentQueries';
import useDebounce from '../../../../Hooks/useDebounce';
import { useNavigate, useParams } from 'react-router-dom';
import useRootPath from '../../../../Hooks/useRootPath';
import EmptyPackageState from '../PackageModal/components/EmptyPackageState';
import ChangedArrows from './components/ChangedArrows';

const useStyles = createUseStyles({
  description: {
    paddingTop: '12px', // 4px on the title bottom padding makes this the "standard" 16 total padding
    paddingBottom: '8px',
    color: global_Color_200.value,
  },
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px',
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
  searchInput: {
    paddingRight: '35px',
    marginRight: '-23px',
  },
  searchIcon: {
    color: global_secondary_color_100.value,
    position: 'relative',
    top: '3px',
    left: '-5px',
    pointerEvents: 'none',
  },
});

const perPageKey = 'snapshotPerPage';

export default function SnapshotListModal() {
  const classes = useStyles();
  const rootPath = useRootPath();
  const { repoUUID: uuid = '' } = useParams();
  const navigate = useNavigate();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const columnHeaders = ['Snapshots', 'Change', 'Packages', 'Errata'];

  const columnSortAttributes = ['created_at'];

  const sortString = useMemo(
    () => columnSortAttributes[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

  const debouncedSearchQuery = useDebounce(searchQuery);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, sortString]);

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetSnapshotList(uuid as string, page, perPage, debouncedSearchQuery, sortString);

  const { data: contentData } = useFetchContent([uuid]);

  useEffect(() => {
    if (isError) {
      onClose();
    }
  }, [isError]);

  const onSetPage: OnSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect: OnPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const sortParams = (columnIndex: number, isDisabled: boolean): ThProps['sort'] | undefined => {
    if (isDisabled || !columnSortAttributes[columnIndex]) return;
    return {
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
    };
  };

  const onClose = () => navigate(rootPath);

  const {
    data: snapshotsList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading;

  const loadingOrZeroCount = fetchingOrLoading || !count;

  return (
    <Modal
      key={uuid}
      position='top'
      hasNoBodyWrapper
      aria-label='Snapshot list modal'
      ouiaId='snapshot_list_modal'
      ouiaSafe={fetchingOrLoading}
      variant={ModalVariant.medium}
      title='Snapshots'
      description={
        <p className={classes.description}>
          View list of snapshots for{' '}
          {contentData?.name ? <b>{contentData?.name}</b> : 'a repository'}.
          {/* You may select snapshots to delete them.
          <br />
          You may also view the snapshot comparisons <b>here</b>. */}
        </p>
      }
      isOpen
      onClose={onClose}
      footer={
        <Button key='close' variant='secondary' onClick={onClose}>
          Close
        </Button>
      }
    >
      <InnerScrollContainer>
        <Grid className={classes.mainContainer}>
          <Flex className={classes.topContainer}>
            <FlexItem>
              {/* <TextInput
                id='search'
                ouiaId='name_search'
                placeholder='Search snapshot'
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                className={classes.searchInput}
              />
              <SearchIcon size='sm' className={classes.searchIcon} /> */}
            </FlexItem>
            <FlexItem>
              <Hide hide={loadingOrZeroCount}>
                <Pagination
                  id='top-pagination-id'
                  widgetId='topPaginationWidgetId'
                  perPageComponent='button'
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
          <Hide hide={!fetchingOrLoading}>
            <Grid className={classes.mainContainer}>
              <SkeletonTable
                rowSize={perPage}
                colSize={columnHeaders.length}
                variant={TableVariant.compact}
              />
            </Grid>
          </Hide>
          <Hide hide={fetchingOrLoading}>
            <TableComposable
              aria-label='snapshot list table'
              ouiaId='snapshot_list_table'
              variant='compact'
            >
              <Hide hide={loadingOrZeroCount}>
                <Thead>
                  <Tr>
                    {columnHeaders.map((columnHeader, index) => (
                      <Th
                        key={columnHeader + '_column'}
                        sort={sortParams(index, loadingOrZeroCount)}
                      >
                        {columnHeader}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
              </Hide>
              <Tbody>
                {snapshotsList.map(
                  (
                    { created_at, content_counts, added_counts, removed_counts }: SnapshotItem,
                    index: number,
                  ) => (
                    <Tr key={created_at + index}>
                      <Td>{new Date(created_at).toUTCString()}</Td>
                      <Td>
                        <ChangedArrows
                          addedCount={
                            (added_counts?.['rpm.advisory'] || 0) +
                            (added_counts?.['rpm.package'] || 0)
                          }
                          removedCount={
                            (removed_counts?.['rpm.advisory'] || 0) +
                            (removed_counts?.['rpm.package'] || 0)
                          }
                        />
                      </Td>
                      <Td>{content_counts?.['rpm.package'] || 0}</Td>
                      <Td>{content_counts?.['rpm.advisory'] || 0}</Td>
                    </Tr>
                  ),
                )}
                <Hide hide={!loadingOrZeroCount}>
                  <EmptyPackageState clearSearch={() => setSearchQuery('')} />
                </Hide>
              </Tbody>
            </TableComposable>
          </Hide>
          <Flex className={classes.bottomContainer}>
            <FlexItem />
            <FlexItem>
              <Hide hide={loadingOrZeroCount}>
                <Pagination
                  id='bottom-pagination-id'
                  widgetId='bottomPaginationWidgetId'
                  perPageComponent='button'
                  itemCount={count}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  variant={PaginationVariant.bottom}
                  onPerPageSelect={onPerPageSelect}
                />
              </Hide>
            </FlexItem>
          </Flex>
        </Grid>
      </InnerScrollContainer>
    </Modal>
  );
}
