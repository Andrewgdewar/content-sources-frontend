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
} from '@patternfly/react-core';
import { SelectVariant } from '@patternfly/react-core/deprecated';
import DropdownSelect from 'components/DropdownSelect_Deprecated/DropdownSelect_Deprecated';
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
const filters = ['Account ID', 'Org ID', 'Status'];
export type AdminTaskFilters = 'Account ID' | 'Org ID' | 'Status';

const AdminTaskFilters = ({ isLoading, setFilterData, filterData }: Props) => {
  const classes = useStyles();
  const [filterType, setFilterType] = useState<AdminTaskFilters>('Account ID');
  const [accountId, setAccountId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const clearFilters = () => {
    setAccountId('');
    setOrgId('');
    setSelectedStatuses([]);
    setFilterData({ accountId: '', orgId: '', statuses: [] });
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
  } = useDebounce({
    accountId,
    orgId,
    selectedStatuses,
  });

  useEffect(() => {
    setFilterData({
      accountId: debouncedAccountId,
      orgId: debouncedOrgId,
      statuses: debouncedSelectedStatuses,
    });
  }, [debouncedAccountId, debouncedOrgId, debouncedSelectedStatuses]);

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
            toggleAriaLabel='filter status'
            toggleId='statusSelect'
            ouiaId='filter_status'
            isDisabled={isLoading}
            options={statusValues}
            variant={SelectVariant.checkbox}
            selectedProp={selectedStatuses}
            setSelected={setSelectedStatuses}
            placeholderText='Filter by status'
          />
        );
      default:
        return <></>;
    }
  }, [filterType, isLoading, accountId, orgId, selectedStatuses]);

  return (
    <Flex direction={{ default: 'column' }}>
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupItem>
              <FlexItem>
                <DropdownSelect
                  toggleId='filterSelectionDropdown'
                  ouiaId='filter_type'
                  isDisabled={isLoading}
                  options={filters}
                  variant={SelectVariant.single}
                  selectedProp={filterType}
                  setSelected={setFilterType}
                  placeholderText='filter'
                  toggleIcon={<FilterIcon />}
                />
              </FlexItem>
            </InputGroupItem>
            <InputGroupItem>
              <FlexItem>{Filter}</FlexItem>
            </InputGroupItem>
          </InputGroup>
        </FlexItem>
      </Flex>
      <Hide hide={!(accountId !== '' || orgId !== '' || selectedStatuses.length)}>
        <FlexItem className={classes.chipsContainer}>
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
