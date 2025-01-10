import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  InputGroup,
  TextInput,
  InputGroupItem,
  InputGroupText,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import Hide from 'components/Hide/Hide';
import { FilterData, ContentOrigin, RepositoryParamsResponse } from 'services/Content/ContentApi';
import { useQueryClient } from 'react-query';
import { REPOSITORY_PARAMS_KEY } from 'services/Content/ContentQueries';
import useDebounce from 'Hooks/useDebounce';
import { createUseStyles } from 'react-jss';
import { isEmpty } from 'lodash';
import { useAppContext } from 'middleware/AppContext';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { useNavigate } from 'react-router-dom';
import DeleteKebab from 'components/DeleteKebab/DeleteKebab';
import { ADD_ROUTE } from 'Routes/constants';
import DropdownSelect from 'components/DropdownSelect/DropdownSelect';

interface Props {
  isLoading?: boolean;
  setFilterData: (filterData: FilterData) => void;
  filterData: FilterData;
  atLeastOneRepoChecked: boolean;
  numberOfReposChecked: number;
  setContentOrigin: (origin: ContentOrigin) => void;
  contentOrigin: ContentOrigin;
}

const useStyles = createUseStyles({
  chipsContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    paddingTop: '16px',
  },
  clearFilters: {
    marginLeft: '16px',
  },
  // Needed to fix styling when "Add repositories" button is disabled
  repositoryActions: {
    display: 'flex',
    flexDirection: 'row',
  },
});

const statusValues = ['Invalid', 'Pending', 'Unavailable', 'Valid'];
export type Filters = 'Name/URL' | 'Version' | 'Architecture' | 'Status';

const ContentListFilters = ({
  isLoading,
  setFilterData,
  filterData,
  atLeastOneRepoChecked,
  numberOfReposChecked,
  setContentOrigin,
  contentOrigin,
}: Props) => {
  const classes = useStyles();
  const { rbac, features } = useAppContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const filters = ['Name/URL', 'Version', 'Architecture', 'Status'];
  const [filterType, setFilterType] = useState<Filters>('Name/URL');
  const [versionNamesLabels, setVersionNamesLabels] = useState({});
  const [archNamesLabels, setArchNamesLabels] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [selectedArches, setSelectedArches] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const isRedHatRepository = contentOrigin === ContentOrigin.REDHAT;

  const { distribution_arches = [], distribution_versions = [] } =
    queryClient.getQueryData<RepositoryParamsResponse>(REPOSITORY_PARAMS_KEY) || {};

  const clearFilters = () => {
    setFilterType('Name/URL');
    setSearchQuery('');
    setSelectedVersions([]);
    setSelectedArches([]);
    setSelectedStatuses([]);
    setFilterData({ searchQuery: '', versions: [], arches: [], statuses: [] });
  };

  useEffect(() => {
    // If the filters get cleared at the top level, sense that and clear them here.
    if (
      filterData.arches?.length === 0 &&
      filterData.versions?.length === 0 &&
      filterData.statuses?.length === 0 &&
      filterData.searchQuery === '' &&
      (searchQuery !== '' ||
        selectedArches.length !== 0 ||
        selectedVersions.length !== 0 ||
        selectedStatuses.length !== 0)
    ) {
      clearFilters();
    }
  }, [filterData]);

  const {
    searchQuery: debouncedSearchQuery,
    selectedVersions: debouncedSelectedVersions,
    selectedArches: debouncedSelectedArches,
    selectedStatuses: debouncedSelectedStatuses,
  } = useDebounce({
    searchQuery,
    selectedVersions,
    selectedArches,
    selectedStatuses,
  });

  const getLabels = (type: string, names: Array<string>) => {
    const namesLabels = type === 'arch' ? distribution_arches : distribution_versions;

    const labels: Array<string> = [];
    names.forEach((name) => {
      const found = namesLabels.find((v) => v.name === name);
      if (found) {
        labels.push(found.label);
      }
    });
    return labels;
  };

  useEffect(() => {
    setFilterData({
      searchQuery: debouncedSearchQuery,
      versions: getLabels('version', debouncedSelectedVersions),
      arches: getLabels('arch', debouncedSelectedArches),
      statuses: debouncedSelectedStatuses,
    });
  }, [
    debouncedSearchQuery,
    debouncedSelectedVersions,
    debouncedSelectedArches,
    debouncedSelectedStatuses,
  ]);

  const deleteItem = (id: string, chips, setChips) => {
    const copyOfChips = [...chips];
    const filteredCopy = copyOfChips.filter((chip) => chip !== id);
    setChips(filteredCopy);
  };

  useEffect(() => {
    if (
      isEmpty(versionNamesLabels) &&
      isEmpty(archNamesLabels) &&
      distribution_arches.length !== 0 &&
      distribution_versions.length !== 0
    ) {
      const arches = {};
      const versions = {};
      distribution_arches.forEach((arch) => (arches[arch.name] = arch.label));
      distribution_versions.forEach((version) => (versions[version.name] = version.label));
      setVersionNamesLabels(versions);
      setArchNamesLabels(arches);
    }
  }, [distribution_arches, distribution_versions]);

  const Filter = useMemo(() => {
    switch (filterType) {
      case 'Name/URL':
        return (
          <InputGroupItem isFill>
            <TextInput
              isDisabled={isLoading}
              id='search'
              ouiaId='filter_search'
              placeholder='Filter by name/url'
              value={searchQuery}
              onChange={(_event, value) => setSearchQuery(value)}
            />
            <InputGroupText isDisabled={isLoading} id='search-icon'>
              <SearchIcon />
            </InputGroupText>
          </InputGroupItem>
        );
      case 'Version':
        return (
          <DropdownSelect
            onSelect={(_, val) =>
              setSelectedVersions((prev) =>
                selectedVersions.includes(val as string)
                  ? prev.filter((item) => item !== (val as string))
                  : [...prev, val as string],
              )
            }
            menuToggleProps={{
              'aria-label': 'filter version',
              id: 'versionSelect',
            }}
            multiSelect
            dropDownItems={Object.keys(versionNamesLabels).map((version) => ({
              hasCheckbox: true,
              value: version,
              isSelected: selectedVersions.includes(version),
              children: version,
              'data-ouia-component-id': `filter_${version}`,
            }))}
            isDisabled={isLoading}
            menuValue='Filter by version'
            ouiaId='filter_version'
          />
        );
      case 'Architecture':
        return (
          <DropdownSelect
            onSelect={(_, val) =>
              setSelectedArches((prev) =>
                selectedArches.includes(val as string)
                  ? prev.filter((item) => item !== (val as string))
                  : [...prev, val as string],
              )
            }
            menuToggleProps={{
              'aria-label': 'filter architecture',
              id: 'archSelect',
            }}
            multiSelect
            dropDownItems={Object.keys(archNamesLabels).map((arch) => ({
              hasCheckbox: true,
              value: arch,
              isSelected: selectedArches.includes(arch),
              children: arch,
              'data-ouia-component-id': `filter_${arch}`,
            }))}
            isDisabled={isLoading}
            menuValue='Filter by architecture'
            ouiaId='filter_arch'
          />
        );
      case 'Status':
        return (
          <DropdownSelect
            onSelect={(_, val) =>
              setSelectedStatuses((prev) =>
                selectedStatuses.includes(val as string)
                  ? prev.filter((item) => item !== (val as string))
                  : [...prev, val as string],
              )
            }
            menuToggleProps={{
              'aria-label': 'filter status',
              id: 'statusSelect',
            }}
            multiSelect
            dropDownItems={statusValues.map((status) => ({
              hasCheckbox: true,
              value: status,
              isSelected: selectedStatuses.includes(status),
              children: status,
              'data-ouia-component-id': `filter_${status}`,
            }))}
            isDisabled={isLoading}
            menuValue='Filter by status'
            ouiaId='filter_status'
          />
        );
      default:
        return <></>;
    }
  }, [
    filterType,
    isLoading,
    searchQuery,
    versionNamesLabels,
    selectedVersions,
    archNamesLabels,
    selectedArches,
    selectedStatuses,
  ]);

  return (
    <Flex direction={{ default: 'column' }}>
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupItem>
              <FlexItem>
                <DropdownSelect
                  onSelect={(_, val) => setFilterType(val as Filters)}
                  menuToggleProps={{
                    'aria-label': 'filterSelectionDropdown',
                    id: 'typeSelect',
                    icon: <FilterIcon />,
                  }}
                  dropDownItems={filters.map((filter) => ({
                    value: filter,
                    isSelected: filterType === filter,
                    children: filter,
                    'data-ouia-component-id': `filter_${filter}`,
                  }))}
                  isDisabled={isLoading}
                  menuValue={filterType}
                  ouiaId='filter_type'
                />
              </FlexItem>
            </InputGroupItem>
            <InputGroupItem>
              <FlexItem>{Filter}</FlexItem>
            </InputGroupItem>
          </InputGroup>
        </FlexItem>
        <Hide hide={!features?.snapshots?.accessible}>
          <FlexItem>
            <ToggleGroup aria-label='Default with single selectable'>
              <ToggleGroupItem
                text='Custom'
                buttonId='custom-repositories-toggle-button'
                data-ouia-component-id='custom-repositories-toggle'
                isSelected={contentOrigin === ContentOrigin.CUSTOM}
                onChange={() => {
                  if (contentOrigin !== ContentOrigin.CUSTOM) {
                    setContentOrigin(ContentOrigin.CUSTOM);
                    // clearFilters(); //This resets the filters when changing Origins if desired.
                  }
                }}
              />
              <ToggleGroupItem
                text='Red Hat'
                buttonId='redhat-repositories-toggle-button'
                data-ouia-component-id='redhat-repositories-toggle'
                isSelected={contentOrigin === ContentOrigin.REDHAT}
                onChange={() => {
                  if (contentOrigin !== ContentOrigin.REDHAT) {
                    setContentOrigin(ContentOrigin.REDHAT);
                    // clearFilters();//This resets the filters when changing Origins if desired.
                  }
                }}
              />
            </ToggleGroup>
          </FlexItem>
        </Hide>
        <FlexItem className={classes.repositoryActions}>
          <ConditionalTooltip
            content='You do not have the required permissions to perform this action.'
            show={!rbac?.repoWrite && !isRedHatRepository}
            setDisabled
          >
            <Button
              id='createContentSourceButton'
              ouiaId='create_content_source'
              variant='primary'
              isDisabled={isLoading || isRedHatRepository}
              onClick={() => navigate(ADD_ROUTE)}
            >
              Add repositories
            </Button>
          </ConditionalTooltip>
          <ConditionalTooltip
            content='You do not have the required permissions to perform this action.'
            show={!rbac?.repoWrite && !isRedHatRepository}
            setDisabled
          >
            <DeleteKebab
              isDisabled={!rbac?.repoWrite || isRedHatRepository}
              atLeastOneRepoChecked={atLeastOneRepoChecked}
              numberOfReposChecked={numberOfReposChecked}
              toggleOuiaId='custom_repositories_kebab_toggle'
            />
          </ConditionalTooltip>
        </FlexItem>
      </Flex>
      <Hide
        hide={
          !(
            selectedVersions.length ||
            selectedArches.length ||
            selectedStatuses.length ||
            searchQuery != ''
          )
        }
      >
        <FlexItem className={classes.chipsContainer}>
          <ChipGroup categoryName='Version'>
            {selectedVersions.map((version) => (
              <Chip
                key={version}
                onClick={() => deleteItem(version, selectedVersions, setSelectedVersions)}
              >
                {version}
              </Chip>
            ))}
          </ChipGroup>
          <ChipGroup categoryName='Architecture'>
            {selectedArches.map((arch) => (
              <Chip key={arch} onClick={() => deleteItem(arch, selectedArches, setSelectedArches)}>
                {arch}
              </Chip>
            ))}
          </ChipGroup>
          <ChipGroup categoryName='Status'>
            {selectedStatuses.map((status) => (
              <Chip
                key={status}
                onClick={() => deleteItem(status, selectedStatuses, setSelectedStatuses)}
              >
                {status}
              </Chip>
            ))}
          </ChipGroup>
          {searchQuery !== '' && (
            <ChipGroup categoryName='Name/URL'>
              <Chip key='search_chip' onClick={() => setSearchQuery('')}>
                {searchQuery}
              </Chip>
            </ChipGroup>
          )}
          {((debouncedSearchQuery !== '' && searchQuery !== '') ||
            !!selectedVersions?.length ||
            !!selectedArches?.length ||
            !!selectedStatuses?.length) && (
            <Button className={classes.clearFilters} onClick={clearFilters} variant='link' isInline>
              Clear filters
            </Button>
          )}
        </FlexItem>
      </Hide>
    </Flex>
  );
};

export default ContentListFilters;
