import {
  BaseCellProps,
  ExpandableRowContent,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ErrataItem } from 'services/Content/ContentApi';
import Hide from '../../Hide/Hide';
import { Flex, FlexItem, Grid, Stack, Text } from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';
import {
  global_BackgroundColor_100,
  global_danger_color_200,
  global_success_color_200,
} from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import useDeepCompareEffect from 'Hooks/useDeepCompareEffect';
import React, { useEffect, useState } from 'react';
import { capitalize, isEmpty } from 'lodash';
import { OffIcon, OnIcon } from '@patternfly/react-icons';
import { formatDateDDMMMYYYY, formatDescription, reduceStringToCharsWithEllipsis } from 'helpers';
import ErrataTypeIcon from '../../ErrataTypeIcon/ErrataTypeIcon';
import SeverityWithIcon from '../../SeverityWithIcon/SeverityWithIcon';
import UrlWithExternalIcon from '../../UrlWithLinkIcon/UrlWithLinkIcon';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';

const red = global_danger_color_200.value;
const green = global_success_color_200.value;

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  expansionBox: {
    padding: '16px 0',
  },
  rightMargin: { marginRight: '6px' },
  red: { extend: 'rightMargin', color: red },
  green: { extend: 'rightMargin', color: green },
  retainSpaces: { whiteSpace: 'pre-line' },
});

interface Props {
  isFetchingOrLoading: boolean;
  isLoadingOrZeroCount: boolean;
  errataList: ErrataItem[];
  clearSearch: () => void;
  perPage: number;
  sortParams: (columnIndex: number) => ThProps['sort'];
  hasFilters: boolean;
}

export default function AdvisoriesTable({
  isFetchingOrLoading,
  isLoadingOrZeroCount,
  errataList,
  clearSearch,
  perPage,
  sortParams,
  hasFilters,
}: Props) {
  const classes = useStyles();
  const [prevLength, setPrev] = useState(perPage || 10);

  const [expandState, setExpandState] = useState({});

  useDeepCompareEffect(() => {
    if (!isEmpty(expandState)) setExpandState({});
  }, [errataList]);

  useEffect(() => {
    setPrev(errataList.length || 10);
  }, [errataList.length]);

  const columnHeaders = [
    { name: 'Name', width: 15 },
    { name: 'Synopsis' },
    { name: 'Type', width: 15 },
    { name: 'Severity', width: 10 },
    { name: 'Publish date', width: 15 },
  ];

  return (
    <>
      <Hide hide={!isFetchingOrLoading}>
        <Grid className={classes.mainContainer}>
          <SkeletonTable
            rows={prevLength}
            columnsCount={columnHeaders.length}
            variant={TableVariant.compact}
          />
        </Grid>
      </Hide>
      <Hide hide={isFetchingOrLoading}>
        <Table aria-label='errata table' ouiaId='errata_table' variant='compact'>
          <Hide hide={isLoadingOrZeroCount}>
            <Thead>
              <Tr>
                <Th screenReaderText='empty' />
                {columnHeaders.map(({ name, width }, index) =>
                  name === 'Name' || name === 'Synopsis' ? (
                    <Th width={width as BaseCellProps['width']} key={index + name + '_header'}>
                      {name}
                    </Th>
                  ) : (
                    <Th
                      width={width as BaseCellProps['width']}
                      key={index + name + '_header'}
                      sort={sortParams(index)}
                    >
                      {name}
                    </Th>
                  ),
                )}
              </Tr>
            </Thead>
          </Hide>
          {[...new Map(errataList.map((e) => [e.errata_id, e])).values()].map(
            (
              {
                errata_id,
                summary,
                description,
                issued_date,
                updated_date,
                type,
                severity,
                reboot_suggested,
              }: ErrataItem,
              rowIndex,
            ) => (
              <Tbody key={errata_id + rowIndex + '-column'}>
                <Tr>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded: !!expandState[rowIndex],
                      onToggle: () =>
                        setExpandState((prev) => ({ ...prev, [rowIndex]: !prev[rowIndex] })),
                      expandId: 'expandable-',
                    }}
                  />
                  <Td>{errata_id}</Td>
                  <Td>{reduceStringToCharsWithEllipsis(summary, 70)}</Td>
                  <Td>
                    <div>
                      <ErrataTypeIcon type={type} iconProps={{ className: classes.rightMargin }} />
                      {capitalize(type)}
                    </div>
                  </Td>
                  <Td>
                    <SeverityWithIcon severity={severity} />
                  </Td>
                  <Td>{formatDateDDMMMYYYY(issued_date)}</Td>
                </Tr>
                <Hide hide={!expandState[rowIndex]}>
                  <Tr>
                    <Td />
                    <Td dataLabel={rowIndex + '-content-label'} colSpan={3}>
                      <ExpandableRowContent key={rowIndex + '-expandablecontent'}>
                        <Stack hasGutter className={classes.expansionBox}>
                          <Flex direction={{ default: 'row' }}>
                            <FlexItem>
                              <strong>Updated date</strong>
                              <Text>
                                {updated_date ? formatDateDDMMMYYYY(updated_date) : 'N/A'}
                              </Text>
                            </FlexItem>
                          </Flex>
                          <Grid>
                            <strong>Description</strong>
                            <Text className={classes.retainSpaces}>
                              {formatDescription(description)}
                            </Text>
                          </Grid>
                          <Grid>
                            <strong>Reboot</strong>
                            <div>
                              {reboot_suggested ? (
                                <OffIcon className={classes.red} />
                              ) : (
                                <OnIcon className={classes.green} />
                              )}
                              {`Reboot is ${reboot_suggested ? '' : 'not '}required`}
                            </div>
                          </Grid>
                          <Grid>
                            <div>
                              {errata_id.startsWith('RH') ? (
                                <UrlWithExternalIcon
                                  href={`https://access.redhat.com/errata/${errata_id}`}
                                  customText='View packages and errata at access.redhat.com'
                                />
                              ) : (
                                ''
                              )}
                            </div>
                          </Grid>
                        </Stack>
                      </ExpandableRowContent>
                    </Td>
                  </Tr>
                </Hide>
              </Tbody>
            ),
          )}
        </Table>
        <Hide hide={!isLoadingOrZeroCount}>
          <EmptyTableState
            notFiltered={!hasFilters}
            clearFilters={clearSearch}
            itemName='advisories'
            notFilteredBody='You may need to add repositories that contain advisories.'
          />
        </Hide>
      </Hide>
    </>
  );
}
