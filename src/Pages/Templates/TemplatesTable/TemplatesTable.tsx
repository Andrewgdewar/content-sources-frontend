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
  ActionsColumn,
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
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { SkeletonTable } from '@patternfly/react-component-groups';
import Hide from 'components/Hide/Hide';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import { Outlet, useNavigate } from 'react-router-dom';
import { TemplateFilterData, TemplateItem } from 'services/Templates/TemplateApi';
import { useDeleteTemplateItemMutate, useTemplateList } from 'services/Templates/TemplateQueries';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { useAppContext } from 'middleware/AppContext';
import { useRepositoryParams } from 'services/Content/ContentQueries';
import TemplateFilters from './components/TemplateFilters';
import { formatDateDDMMMYYYY } from 'helpers';
import { useQueryClient } from 'react-query';
import Header from 'components/Header/Header';

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
    height: 'fit-content',
  },
  invisible: {
    opacity: 0,
  },
  spinnerMinWidth: {
    width: '50px!important',
  },
});

const perPageKey = 'templatesPerPage';

const TemplatesTable = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { rbac } = useAppContext();
  const queryClient = useQueryClient();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(3); // queued_at
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('desc');

  const defaultValues: TemplateFilterData = {
    arch: '',
    version: '',
    search: '',
  };

  const [filterData, setFilterData] = useState<TemplateFilterData>(defaultValues);

  const clearFilters = () => setFilterData(defaultValues);

  const notFiltered =
    filterData.arch === '' && filterData.version === '' && filterData.search === '';

  const columnSortAttributes = ['name', 'arch', 'version'];

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
  } = useTemplateList(page, perPage, sortString, filterData);

  const { mutateAsync: deleteItem, isLoading: isDeleting } = useDeleteTemplateItemMutate(
    queryClient,
    page,
    perPage,
    sortString,
    filterData,
  );

  const onSetPage = (_, newPage: number) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
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

  const columnHeaders = ['Name', 'Description', 'Architecture', 'Version', 'Date'];

  const {
    isLoading: repositoryParamsLoading,
    error: repositoryParamsError,
    isError: repositoryParamsIsError,
    data: { distribution_versions: distVersions, distribution_arches: distArches } = {
      distribution_versions: [],
      distribution_arches: [],
    },
  } = useRepositoryParams();

  const actionTakingPlace = isLoading || isFetching || repositoryParamsLoading || isDeleting;

  // Error is caught in the wrapper component
  if (isError) throw error;
  if (repositoryParamsIsError) throw repositoryParamsError;

  const archesDisplay = (arch: string) => distArches.find(({ label }) => arch === label)?.name;

  const versionDisplay = (version: string) =>
    distVersions.find(({ label }) => version === label)?.name;

  const {
    data: templateList = [],
    meta: { count = 0 },
  } = data;

  const itemName = 'templates';
  const notFilteredBody = 'To get started, create a content template';

  const countIsZero = count === 0;

  if (countIsZero && notFiltered && !isLoading)
    return (
      <Bullseye
        data-ouia-safe={!actionTakingPlace}
        data-ouia-component-id='content_template_list_page'
      >
        <EmptyTableState
          notFiltered={notFiltered}
          clearFilters={clearFilters}
          itemName={itemName}
          notFilteredBody={notFilteredBody}
          notFilteredButton={
            <ConditionalTooltip
              content='You do not have the required permissions to perform this action.'
              show={!rbac?.templateWrite}
              setDisabled
            >
              <Button
                id='createContentTemplateButton'
                ouiaId='create_content_template'
                variant='primary'
                isDisabled={isLoading}
                onClick={() => navigate('add')}
              >
                Add template
              </Button>
            </ConditionalTooltip>
          }
        />
        <Outlet />
      </Bullseye>
    );

  return (
    <>
      <Header
        title='Templates'
        ouiaId='templates_description'
        paragraph='View all content templates within your organization.'
      />
      <Grid
        data-ouia-safe={!actionTakingPlace}
        data-ouia-component-id='content_template_list_page'
        className={countIsZero ? classes.mainContainer100Height : classes.mainContainer}
      >
        <Outlet />
        <Flex className={classes.topContainer}>
          <TemplateFilters
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
              numberOfColumns={columnHeaders.length}
              variant={TableVariant.compact}
            />
          </Grid>
        </Hide>
        <Hide hide={countIsZero || isLoading}>
          <>
            <Table
              aria-label='Content template table'
              ouiaId='content_template_table'
              variant='compact'
            >
              <Thead>
                <Tr>
                  {columnHeaders.map((columnHeader, index) => (
                    <Th key={columnHeader + 'column'} sort={sortParams(index)}>
                      {columnHeader}
                    </Th>
                  ))}
                  <Th className={classes.spinnerMinWidth}>
                    <Spinner size='md' className={actionTakingPlace ? '' : classes.invisible} />
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {templateList.map(
                  ({ uuid, name, description, arch, version, date }: TemplateItem, index) => (
                    <Tr key={uuid + index}>
                      <Td>{name}</Td>
                      <Td>{description}</Td>
                      <Td>{archesDisplay(arch)}</Td>
                      <Td>{versionDisplay(version)}</Td>
                      <Td>{formatDateDDMMMYYYY(date)}</Td>
                      <Td>
                        <ConditionalTooltip
                          content='You do not have the required permissions to perform this action.'
                          show={!rbac?.templateWrite}
                          setDisabled
                        >
                          <ActionsColumn
                            items={[
                              {
                                title: 'Edit',
                                onClick: () => navigate(`${uuid}/edit`),
                              },
                              { isSeparator: true },
                              {
                                title: 'Delete',
                                onClick: () =>
                                  deleteItem(uuid).then(() => {
                                    // If last item being deleted on a page, go back one page.
                                    if (
                                      page > 1 &&
                                      count / perPage + 1 >= page &&
                                      (count - 1) % perPage === 0
                                    ) {
                                      setPage(page - 1);
                                    }
                                  }),
                              },
                            ]}
                          />
                        </ConditionalTooltip>
                      </Td>
                    </Tr>
                  ),
                )}
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
                show={!rbac?.templateWrite}
                setDisabled
              >
                <Button
                  id='createContentTemplateButton'
                  ouiaId='create_content_template'
                  variant='primary'
                  isDisabled={isLoading}
                  onClick={() => navigate('add')}
                >
                  Add template
                </Button>
              </ConditionalTooltip>
            }
          />
        </Hide>
      </Grid>
    </>
  );
};

export default TemplatesTable;
