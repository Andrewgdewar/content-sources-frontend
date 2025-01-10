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
import { global_BackgroundColor_100, global_Color_200 } from '@patternfly/react-tokens';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { SearchIcon } from '@patternfly/react-icons';
import useDebounce from 'Hooks/useDebounce';
import { useParams } from 'react-router-dom';
import PackagesTable from 'components/SharedTables/PackagesTable';
import { useFetchTemplatePackages } from 'services/Templates/TemplateQueries';
import Loader from 'components/Loader';

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
    minHeight: '68px', // Prevents compacting of the search box (patternfly bug?)
  },
  bottomContainer: {
    justifyContent: 'space-between',
    minHeight: '68px',
  },
});

const perPageKey = 'TemplatePackagePerPage';

export default function TemplatePackageTab() {
  const classes = useStyles();
  const { templateUUID: uuid } = useParams();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, !searchQuery ? 0 : 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  const {
    isLoading,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useFetchTemplatePackages(page, perPage, debouncedSearchQuery, uuid as string);

  const onSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const {
    data: packagesList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading;

  const loadingOrZeroCount = fetchingOrLoading || !count;

  if (isLoading) {
    return <Loader />;
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
      <PackagesTable
        packagesList={packagesList}
        isFetchingOrLoading={fetchingOrLoading}
        isLoadingOrZeroCount={loadingOrZeroCount}
        clearSearch={() => setSearchQuery('')}
        perPage={perPage}
        search={debouncedSearchQuery}
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
