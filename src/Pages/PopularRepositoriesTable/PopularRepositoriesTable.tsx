import {
  Button,
  Flex,
  FlexItem,
  Grid,
  InputGroup,
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PaginationVariant,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  global_BackgroundColor_100,
  global_secondary_color_100,
  global_disabled_color_100,
} from '@patternfly/react-tokens';
import { useEffect, useState, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';

import {
  usePopularRepositoriesQuery,
  useDeletePopularRepositoryMutate,
  useRepositoryParams,
  useAddPopularRepositoryQuery,
  useBulkDeleteContentItemMutate,
} from '../../services/Content/ContentQueries';
import {
  CreateContentRequest,
  CreateContentRequestItem,
  FilterData,
  PopularRepository,
} from '../../services/Content/ContentApi';
import Hide from '../../components/Hide/Hide';
import { useQueryClient } from 'react-query';
import { useAppContext } from '../../middleware/AppContext';
import ConditionalTooltip from '../../components/ConditionalTooltip/ConditionalTooltip';
import UrlWithExternalIcon from '../../components/UrlWithLinkIcon/UrlWithLinkIcon';
import { SearchIcon } from '@patternfly/react-icons';
import useDebounce from '../../Hooks/useDebounce';
import EmptyTableState from '../../components/EmptyTableState/EmptyTableState';
import DeleteKebab from '../../components/DeleteKebab/DeleteKebab';
import { repoToRequestItem } from './helper';

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
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
  searchInput: {
    paddingRight: '35px',
    marginRight: '-23px',
  },
  searchIcon: {
    color: global_secondary_color_100.value,
    position: 'relative',
    left: '-5px',
    pointerEvents: 'none',
  },
  addRepositoriesButton: {
    marginLeft: '16px',
  },
  checkboxMinWidth: {
    minWidth: '45px!important',
  },
  disabled: {
    color: global_disabled_color_100.value,
  },
  repositoryActions: {
    display: 'flex',
    flexDirection: 'row',
  },
});

const perPageKey = 'popularRepositoriesperPage';

const PopularRepositoriesTable = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { rbac } = useAppContext();
  // Uses urls as map key because uuids don't exist on repositories that haven't been created
  const [checkedRepositoriesToAdd, setCheckedRepositoriesToAdd] = useState<
    Map<string, CreateContentRequestItem>
  >(new Map());
  // Set of uuids which are required for bulk delete
  const [checkedRepositoriesToDelete, setCheckedRepositoriesToDelete] = useState<Set<string>>(
    new Set(),
  );
  const [selectedData, setSelectedData] = useState<CreateContentRequest>([]);
  const [selectedUUID, setSelectedUUID] = useState<string>('');

  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue);
  const [perPage, setPerPage] = useState(storedPerPage);

  const {
    isLoading,
    error,
    isError,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = usePopularRepositoriesQuery(page, perPage, {
    searchQuery: !searchValue ? searchValue : debouncedSearchValue,
  });

  const {
    isLoading: repositoryParamsLoading,
    error: repositoryParamsError,
    isError: repositoryParamsIsError,
    data: { distribution_versions: distVersions, distribution_arches: distArches } = {
      distribution_versions: [],
      distribution_arches: [],
    },
  } = useRepositoryParams();

  const { mutateAsync: addContentQuery, isLoading: isAdding } = useAddPopularRepositoryQuery(
    queryClient,
    selectedData,
    page,
    perPage,
    { searchQuery: debouncedSearchValue } as FilterData,
  );

  const clearCheckedRepositories = () => {
    setCheckedRepositoriesToAdd(new Map());
    setCheckedRepositoriesToDelete(new Set());
  };

  const selectAllRepos = (_, checked: boolean) => {
    const newSet = new Set(checkedRepositoriesToDelete);
    const newMap = new Map(checkedRepositoriesToAdd);
    if (checked) {
      popularData.forEach((repo) => {
        if (repo.uuid) {
          newSet.add(repo.uuid);
        } else {
          newMap.set(repo.url, repoToRequestItem(repo));
        }
      });
    } else {
      popularData.forEach((repo) => {
        if (repo.uuid) {
          newSet.delete(repo.uuid);
        } else {
          newMap.delete(repo.url);
        }
      });
    }
    setCheckedRepositoriesToDelete(newSet);
    setCheckedRepositoriesToAdd(newMap);
  };

  const atLeastOneRepoToDeleteChecked = useMemo(
    () => checkedRepositoriesToDelete.size >= 1,
    [checkedRepositoriesToDelete],
  );
  const atLeastOneRepoToAddChecked = useMemo(
    () => checkedRepositoriesToAdd.size >= 1,
    [checkedRepositoriesToAdd],
  );

  const areAllReposSelected = useMemo(
    () =>
      data.data.every((repo) => {
        if (repo.uuid) {
          return checkedRepositoriesToDelete.has(repo.uuid);
        } else {
          return checkedRepositoriesToAdd.has(repo.url);
        }
      }),
    [data, checkedRepositoriesToAdd, checkedRepositoriesToDelete],
  );

  const onSelectRepo = (repo: PopularRepository, value: boolean) => {
    if (repo.uuid) {
      const newSet = new Set(checkedRepositoriesToDelete);
      if (value) {
        newSet.add(repo.uuid);
      } else {
        newSet.delete(repo.uuid);
      }
      setCheckedRepositoriesToDelete(newSet);
    } else {
      const newMap = new Map(checkedRepositoriesToAdd);
      if (value) {
        newMap.set(repo.url, repoToRequestItem(repo));
      } else {
        newMap.delete(repo.url);
      }
      setCheckedRepositoriesToAdd(newMap);
    }
  };

  useEffect(() => {
    if (!isFetching) {
      setSelectedData([]);
      setSelectedUUID('');
    }
  }, [isFetching]);

  useEffect(() => {
    if (selectedData.length != 0) {
      addContentQuery().then(
        () => {
          setSelectedData([]);
          clearCheckedRepositories();
        },
        () => setSelectedData([]),
      );
    }
  }, [selectedData]);

  useEffect(() => {
    if (selectedUUID) {
      deleteItem(selectedUUID).then(clearCheckedRepositories, () => setSelectedUUID(''));
    }
  }, [selectedUUID]);

  const archesDisplay = (arch: string) => distArches.find(({ label }) => arch === label)?.name;

  const versionDisplay = (versions: Array<string>): string =>
    distVersions
      .filter(({ label }) => versions?.includes(label))
      .map(({ name }) => name)
      .join(', ');

  const { mutateAsync: deleteItem, isLoading: isDeleting } = useDeletePopularRepositoryMutate(
    queryClient,
    page,
    perPage,
    { searchQuery: debouncedSearchValue } as FilterData,
  );

  const { mutateAsync: deleteItems, isLoading: isDeletingItems } = useBulkDeleteContentItemMutate(
    queryClient,
    checkedRepositoriesToDelete,
    page,
    perPage,
    { searchQuery: debouncedSearchValue } as FilterData,
    undefined, // sort string
  );

  // Other update actions will be added to this later.
  const actionTakingPlace =
    isDeleting || isFetching || repositoryParamsLoading || isAdding || isDeletingItems;

  const onSetPage: OnSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect: OnPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    localStorage.setItem(perPageKey, newPerPage.toString());
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const addSelected = () => {
    const request: CreateContentRequest = [];
    checkedRepositoriesToAdd.forEach((repo) => {
      request.push(repo);
    });
    setSelectedData(request);
  };

  const deleteSelected = async () => {
    deleteItems(checkedRepositoriesToDelete).then(() => {
      const newMaxPage = Math.ceil((count - checkedRepositoriesToDelete.size) / perPage);
      if (page > 1 && newMaxPage < page) {
        setPage(newMaxPage);
      }
      clearCheckedRepositories();
    });
  };

  const columnHeaders = ['Name', 'Architecture', 'Versions'];

  // Error is caught in the wrapper component
  if (isError) throw error;
  if (repositoryParamsIsError) throw repositoryParamsError;

  const {
    data: popularData = [],
    meta: { count = 0 },
  } = data;

  const countIsZero = !data?.data?.length;

  return (
    <Grid
      data-ouia-safe={!actionTakingPlace}
      data-ouia-component-id='popular_repositories_page'
      className={classes.mainContainer}
    >
      <Flex className={classes.topContainer}>
        <FlexItem>
          <InputGroup>
            <FlexItem>
              <TextInput
                isDisabled={isLoading}
                id='search'
                ouiaId='popular_filter_search'
                placeholder='Filter by name/url'
                value={searchValue}
                onChange={setSearchValue}
                className={classes.searchInput}
              />
              <SearchIcon size='sm' className={classes.searchIcon} />
            </FlexItem>
            <FlexItem className={classes.repositoryActions}>
              {/* RBAC popover takes precedence */}
              <ConditionalTooltip
                content={
                  !rbac?.write
                    ? 'You do not have the required permissions to perform this action.'
                    : 'Make a selection below to add multiple repositories'
                }
                show={!rbac?.write || !atLeastOneRepoToAddChecked}
                setDisabled
              >
                <Button
                  onClick={addSelected}
                  className={classes.addRepositoriesButton}
                  ouiaId='add_checked_repos'
                >
                  {atLeastOneRepoToAddChecked
                    ? `Add ${checkedRepositoriesToAdd.size} repositories`
                    : 'Add selected repositories'}
                </Button>
              </ConditionalTooltip>
              <ConditionalTooltip
                content='You do not have the required permissions to perform this action.'
                show={!rbac?.write}
                setDisabled
              >
                <DeleteKebab
                  atLeastOneRepoChecked={atLeastOneRepoToDeleteChecked}
                  numberOfReposChecked={checkedRepositoriesToDelete.size}
                  deleteCheckedRepos={deleteSelected}
                />
              </ConditionalTooltip>
            </FlexItem>
          </InputGroup>
        </FlexItem>
        <FlexItem>
          <Hide hide={isLoading || countIsZero}>
            <Pagination
              id='top-pagination-id'
              widgetId='topPaginationWidgetId'
              perPageComponent='button'
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
            rowSize={perPage}
            colSize={columnHeaders.length}
            variant={TableVariant.compact}
          />
        </Grid>
      </Hide>
      <Hide hide={isLoading || countIsZero}>
        <>
          <TableComposable
            aria-label='Popular repositories table'
            ouiaId='popular_repos_table'
            variant='compact'
          >
            <Thead>
              <Tr>
                <Hide hide={!rbac?.write}>
                  <Th
                    className={classes.checkboxMinWidth}
                    select={{
                      onSelect: selectAllRepos,
                      isSelected: areAllReposSelected,
                    }}
                  />
                </Hide>
                {columnHeaders.map((columnHeader) => (
                  <Th key={columnHeader + 'column'}>{columnHeader}</Th>
                ))}
                <Th>
                  <Spinner size='md' className={actionTakingPlace ? '' : classes.invisible} />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {popularData.map((repo, key) => {
                const {
                  uuid,
                  existing_name,
                  suggested_name,
                  url,
                  distribution_arch,
                  distribution_versions,
                  gpg_key,
                  metadata_verification,
                } = repo;
                return (
                  <Tr key={suggested_name + key}>
                    <Hide hide={!rbac?.write}>
                      {/* Never disabled because popular repositories can be both added and deleted */}
                      <Td
                        select={{
                          rowIndex: key,
                          onSelect: (_event, isSelecting) => onSelectRepo(repo, isSelecting),
                          isSelected: uuid
                            ? checkedRepositoriesToDelete.has(uuid)
                            : checkedRepositoriesToAdd.has(url),
                        }}
                      />
                    </Hide>
                    <Td>
                      <>
                        <Flex direction={{ default: 'row' }}>
                          <FlexItem> {suggested_name}</FlexItem>
                          {existing_name && suggested_name !== existing_name && (
                            <FlexItem className={classes.disabled}>
                              Current name: {existing_name}
                            </FlexItem>
                          )}
                        </Flex>
                        <UrlWithExternalIcon href={url} />
                      </>
                    </Td>
                    <Td>{archesDisplay(distribution_arch)}</Td>
                    <Td>{versionDisplay(distribution_versions)}</Td>
                    <Td width={10}>
                      <ConditionalTooltip
                        content='You do not have the required permissions to perform this action.'
                        show={!rbac?.write}
                        setDisabled
                      >
                        {uuid ? (
                          <Button
                            isDisabled={uuid === selectedUUID || isAdding}
                            onClick={() => setSelectedUUID(uuid)}
                            variant='danger'
                            ouiaId='remove_popular_repo'
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant='secondary'
                            isDisabled={
                              selectedData[key]?.url === url ||
                              isFetching ||
                              isDeleting ||
                              isDeletingItems
                            }
                            onClick={() => {
                              const newData: CreateContentRequest = [];
                              newData[key] = {
                                name: suggested_name,
                                url,
                                distribution_versions,
                                distribution_arch,
                                gpg_key,
                                metadata_verification,
                              };
                              setSelectedData(newData);
                            }}
                            ouiaId='add_popular_repo'
                          >
                            Add
                          </Button>
                        )}
                      </ConditionalTooltip>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableComposable>
          <Hide hide={isLoading || countIsZero}>
            <Flex className={classes.bottomContainer}>
              <FlexItem />
              <FlexItem>
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
              </FlexItem>
            </Flex>
          </Hide>
        </>
      </Hide>
      <Hide hide={!countIsZero}>
        <EmptyTableState
          clearFilters={() => setSearchValue('')}
          notFiltered={!debouncedSearchValue} // The second item prevents the clear button from being removed abruptly
          itemName='popular repositories'
        />
      </Hide>
    </Grid>
  );
};

export default PopularRepositoriesTable;
