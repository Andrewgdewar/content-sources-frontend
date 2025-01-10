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
  type SelectOptionProps,
} from '@patternfly/react-core';
import DropdownSelect from 'components/DropdownSelect/DropdownSelect';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import Hide from 'components/Hide/Hide';
import useDebounce from 'Hooks/useDebounce';
import { createUseStyles } from 'react-jss';
import { AdminTaskFilterData } from 'services/AdminTasks/AdminTaskApi';

interface Props {
  isLoading?: boolean;
  setFilterData: (filterData: AdminTaskFilterData) => void;
  filterData: AdminTaskFilterData;
}

const useStyles = createUseStyles({
  chipsContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    paddingTop: '16px',
  },
  clearFilters: {
    marginLeft: '16px',
  },
});

const statusValues = ['Running', 'Failed', 'Completed', 'Canceled', 'Pending'];
const typeValues = [
  'snapshot',
  'delete-repository-snapshots',
  'introspect',
  'delete-templates',
  'update-template-content',
  'update-repository',
];
const filters = ['Account ID', 'Org ID', 'Status', 'Type'];
export type AdminTaskFilters = 'Account ID' | 'Org ID' | 'Status' | 'Type';

const AdminTaskFilters = ({ isLoading, setFilterData, filterData }: Props) => {
  const classes = useStyles();
  const [filterType, setFilterType] = useState<AdminTaskFilters>('Account ID');
  const [accountId, setAccountId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypenames, setSelectedTypenames] = useState<string[]>([]);

  const clearFilters = () => {
    setAccountId('');
    setOrgId('');
    setSelectedStatuses([]);
    setSelectedTypenames([]);
    setFilterData({ accountId: '', orgId: '', statuses: [], typenames: [] });
  };

  const deleteItem = (id: string, chips, setChips) => {
    const copyOfChips = [...chips];
    const filteredCopy = copyOfChips.filter((chip) => chip !== id);
    setChips(filteredCopy);
  };

  useEffect(() => {
    // If the filters get cleared at the top level, sense that and clear them here.
    if (
      filterData.accountId === '' &&
      filterData.orgId === '' &&
      filterData.statuses.length === 0 &&
      (accountId !== '' || orgId !== '' || selectedStatuses.length !== 0)
    ) {
      clearFilters();
    }
  }, [filterData]);

  const {
    accountId: debouncedAccountId,
    orgId: debouncedOrgId,
    selectedStatuses: debouncedSelectedStatuses,
    selectedTypenames: debouncedSelectedTypenames,
  } = useDebounce({
    accountId,
    orgId,
    selectedStatuses,
    selectedTypenames,
  });

  useEffect(() => {
    setFilterData({
      accountId: debouncedAccountId,
      orgId: debouncedOrgId,
      statuses: debouncedSelectedStatuses,
      typenames: debouncedSelectedTypenames,
    });
  }, [debouncedAccountId, debouncedOrgId, debouncedSelectedStatuses, debouncedSelectedTypenames]);

  const Filter = useMemo(() => {
    switch (filterType) {
      case 'Account ID':
        return (
          <InputGroupItem>
            <TextInput
              type='text'
              isDisabled={isLoading}
              id='account-id'
              ouiaId='filter_account_id'
              placeholder='Filter by account ID'
              value={accountId}
              onChange={(_event, value) => setAccountId(value)}
            />
            <InputGroupText isDisabled={isLoading} id='search-icon'>
              <SearchIcon />
            </InputGroupText>
          </InputGroupItem>
        );
      case 'Org ID':
        return (
          <InputGroupItem>
            <TextInput
              isDisabled={isLoading}
              id='org-id'
              ouiaId='filter_org_id'
              placeholder='Filter by org ID'
              value={orgId}
              onChange={(_event, value) => setOrgId(value)}
            />
            <InputGroupText id='search-icon'>
              <SearchIcon />
            </InputGroupText>
          </InputGroupItem>
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
            dropDownItems={
              statusValues.map((status) => ({
                hasCheckbox: true,
                value: status,
                isSelected: selectedStatuses.includes(status),
                children: status,
                'data-ouia-component-id': `filter_${status}`,
              })) as SelectOptionProps[]
            }
            isDisabled={isLoading}
            menuValue='Filter by status'
            ouiaId='filter_status'
          />
        );
      case 'Type':
        return (
          <DropdownSelect
            onSelect={(_, val) =>
              setSelectedTypenames((prev) =>
                selectedTypenames.includes(val as string)
                  ? prev.filter((item) => item !== (val as string))
                  : [...prev, val as string],
              )
            }
            menuToggleProps={{
              'aria-label': 'filter type',
              id: 'typeSelect',
            }}
            multiSelect
            dropDownItems={
              typeValues.map((status) => ({
                hasCheckbox: true,
                value: status,
                isSelected: selectedTypenames.includes(status),
                children: status,
                'data-ouia-component-id': `filter_${status}`,
              })) as SelectOptionProps[]
            }
            isDisabled={isLoading}
            menuValue='Filter by type'
            ouiaId='filter_type'
          />
        );
      default:
        return <></>;
    }
  }, [filterType, isLoading, accountId, orgId, selectedStatuses, selectedTypenames]);

  return (
    <Flex direction={{ default: 'column' }}>
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupItem>
              <FlexItem>
                <DropdownSelect
                  onSelect={(_, val) => setFilterType(val as AdminTaskFilters)}
                  menuToggleProps={{
                    'aria-label': 'filterSelectionDropdown',
                    id: 'typeSelect',
                    icon: <FilterIcon />,
                  }}
                  dropDownItems={
                    filters.map((filter) => ({
                      value: filter,
                      isSelected: filterType === filter,
                      children: filter,
                      'data-ouia-component-id': `filter_${filter}`,
                    })) as SelectOptionProps[]
                  }
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
      </Flex>
      <Hide
        hide={
          !(accountId !== '' || orgId !== '' || selectedStatuses.length || selectedTypenames.length)
        }
      >
        <FlexItem className={classes.chipsContainer}>
          <ChipGroup categoryName='Type'>
            {selectedTypenames.map((type) => (
              <Chip
                key={type}
                onClick={() => deleteItem(type, selectedTypenames, setSelectedTypenames)}
              >
                {type}
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
          {orgId !== '' && (
            <ChipGroup categoryName='Org ID'>
              <Chip key='org_id_chip' onClick={() => setOrgId('')}>
                {orgId}
              </Chip>
            </ChipGroup>
          )}
          {accountId !== '' && (
            <ChipGroup categoryName='Account ID'>
              <Chip key='account_id_chip' onClick={() => setAccountId('')}>
                {accountId}
              </Chip>
            </ChipGroup>
          )}
          {((debouncedAccountId !== '' && accountId !== '') ||
            (debouncedOrgId !== '' && orgId !== '') ||
            !!selectedTypenames?.length ||
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

export default AdminTaskFilters;
