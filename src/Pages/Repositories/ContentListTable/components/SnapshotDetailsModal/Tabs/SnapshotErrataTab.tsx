import {
  Grid,
  InputGroup,
  Pagination,
  Flex,
  FlexItem,
  PaginationVariant,
} from '@patternfly/react-core';
import Hide from 'components/Hide/Hide';
import { ContentOrigin } from 'services/Content/ContentApi';
import { createUseStyles } from 'react-jss';
import { global_BackgroundColor_100, global_Color_200 } from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import { useAppContext } from 'middleware/AppContext';
import { useGetSnapshotErrataQuery } from 'services/Content/ContentQueries';
import AdvisoriesTable from 'components/SharedTables/AdvisoriesTable';
import SnapshotErrataFilters from './SnapshotErrataFilters';
import { ThProps } from '@patternfly/react-table';

const useStyles = createUseStyles({
  description: {
    paddingTop: '12px',
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
    padding: '16px 24px 16px 0',
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
  alignTop: {
    alignItems: 'baseline',
  },
});

const perPageKey = 'snapshotErrataPerPage';
const defaultFilterState = { search: '', type: [] as string[], severity: [] as string[] };

export function SnapshotErrataTab() {
  const classes = useStyles();
  const { contentOrigin } = useAppContext();

  const { snapshotUUID = '' } = useParams();
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [filterData, setFilterData] = useState(defaultFilterState);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(-1);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setPage(1);
  }, [filterData]);

  const columnSortAttributes = ['name', 'synopsis', 'type', 'severity', 'issued_date'];

  const sortString = useMemo(
    () =>
      activeSortIndex === -1
        ? ''
        : columnSortAttributes[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetSnapshotErrataQuery(
    snapshotUUID,
    page,
    perPage,
    filterData.search,
    filterData.type,
    filterData.severity,
    sortString,
  );

  useEffect(() => {
    if (isError) {
      onClose();
    }
  }, [isError]);

  const onSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const onClose = () =>
    navigate(rootPath + (contentOrigin === ContentOrigin.REDHAT ? `?origin=${contentOrigin}` : ''));

  const {
    data: errataList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading;

  const loadingOrZeroCount = fetchingOrLoading || !count;

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

  return (
    <Grid className={classes.mainContainer}>
      <InputGroup className={classes.topContainer}>
        <SnapshotErrataFilters
          isLoading={isLoading}
          filterData={filterData}
          setFilterData={setFilterData}
        />
        <Hide hide={isLoading}>
          <Pagination
            className={classes.alignTop}
            id='top-pagination-id'
            widgetId='topPaginationWidgetId'
            itemCount={count}
            perPage={perPage}
            page={page}
            onSetPage={onSetPage}
            isCompact
            onPerPageSelect={onPerPageSelect}
          />
        </Hide>
      </InputGroup>
      <AdvisoriesTable
        errataList={errataList}
        isFetchingOrLoading={fetchingOrLoading}
        isLoadingOrZeroCount={loadingOrZeroCount}
        clearSearch={() => setFilterData(defaultFilterState)}
        perPage={perPage}
        sortParams={sortParams}
      />
      <Flex className={classes.bottomContainer}>
        <FlexItem />
        <FlexItem>
          <Hide hide={isLoading}>
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
          </Hide>
        </FlexItem>
      </Flex>
    </Grid>
  );
}
