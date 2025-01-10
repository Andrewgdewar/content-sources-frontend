import Loader from 'components/Loader';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';

import {
  Flex,
  FlexItem,
  Grid,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Pagination,
  PaginationVariant,
  TextInput,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import {
  useFetchTemplate,
  useFetchTemplateSnapshotsQuery,
} from 'services/Templates/TemplateQueries';
import TemplateRepositoriesTable from 'Pages/Templates/TemplateDetails/components/Tables/TemplateRepositoriesTable';

import type { ThProps } from '@patternfly/react-table';

const useStyles = createUseStyles({
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
    minHeight: '68px', // Prevents compacting of the search box (patternfly bug?)
  },
  bottomContainer: {
    justifyContent: 'space-between',
    minHeight: '68px',
  },
});

const perPageKey = 'TemplateRepositoriesPerPage';

export default function TemplateRepositoriesTab() {
  const classes = useStyles();
  const { templateUUID: uuid } = useParams();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSortIndex, setActiveSortIndex] = useState<number>(-1);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const hasSearch = useMemo(() => !!searchQuery, [searchQuery]);
  useEffect(() => {
    setPage(1);
  }, [hasSearch]);

  const columnSortAttributes = ['repository_name', 'created_at'];
  const sortString = useMemo(
    () =>
      activeSortIndex === -1
        ? ''
        : columnSortAttributes[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

  const {
    isLoading: isLoadingTemplate,
    isFetching: isFetchingTemplate,
    isError: isErrorTemplate,
    error: templateError,
    data: template,
  } = useFetchTemplate(uuid as string);

  const {
    isLoading,
    isFetching,
    isError,
    error,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useFetchTemplateSnapshotsQuery(uuid as string, page, perPage, searchQuery, sortString);

  const onSetPage = (_, newPage) => setPage(newPage);
  const onPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const {
    data: snapshotList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading || isLoadingTemplate || isFetchingTemplate;
  const loadingOrZeroCount = fetchingOrLoading || !count;

  const sortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  if (isLoading || isLoadingTemplate) {
    return <Loader />;
  }
  if (isError) {
    throw error;
  }
  if (isErrorTemplate) {
    throw templateError;
  }

  return (
    <Grid className={classes.mainContainer}>
      <InputGroup className={classes.topContainer}>
        <InputGroupItem>
          <TextInput
            id='search'
            ouiaId='name_search'
            placeholder='Filter by name'
            value={searchQuery}
            onChange={(_event, value) => setSearchQuery(value)}
          />
          <InputGroupText id='search-icon'>
            <SearchIcon />
          </InputGroupText>
        </InputGroupItem>
        <Pagination
          id='top-pagination-id'
          widgetId='topPaginationWidgetId'
          itemCount={count}
          perPage={perPage}
          page={page}
          onSetPage={onSetPage}
          isCompact
          onPerPageSelect={onPerPageSelect}
        />
      </InputGroup>
      <TemplateRepositoriesTable
        isFetchingOrLoading={fetchingOrLoading}
        isLoadingOrZeroCount={loadingOrZeroCount}
        snapshotList={snapshotList}
        toBeDeletedSnapshots={template?.to_be_deleted_snapshots ?? []}
        clearSearch={() => setSearchQuery('')}
        perPage={perPage}
        sortParams={sortParams}
        hasSearch={hasSearch}
      />
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
    </Grid>
  );
}
