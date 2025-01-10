import {
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  type ThProps,
} from '@patternfly/react-table';
import Hide from '../../../../../components/Hide/Hide';
import { Button, Grid, TooltipPosition } from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { global_BackgroundColor_100, global_disabled_color_100 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import { useEffect, useState } from 'react';
import type { SystemItem } from 'services/Systems/SystemsApi';
import { TagIcon } from '@patternfly/react-icons';
import { reduceStringToCharsWithEllipsis } from 'helpers';
import useRootPath from 'Hooks/useRootPath';
import { DETAILS_ROUTE, PATCH_SYSTEMS_ROUTE, TEMPLATES_ROUTE } from 'Routes/constants';
import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import { useParams } from 'react-router-dom';

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  forceDisabled: {
    color: global_disabled_color_100.value + '!important',
  },
  rightMargin: {
    marginRight: '0.5rem',
  },
  fixLabelFontSize: {
    fontSize: 'small!important',
  },
});

interface Props {
  isFetchingOrLoading: boolean;
  isLoadingOrZeroCount: boolean;
  systemsList: SystemItem[];
  perPage: number;
  selected: Set<string>;
  setSelected: (id: string) => void;
  sortParams?: (columnIndex: number) => ThProps['sort'];
  selectAllToggle: () => void;
  allSelected: boolean;
}

export default function ModalSystemsTable({
  isFetchingOrLoading,
  isLoadingOrZeroCount,
  systemsList,
  perPage,
  sortParams,
  setSelected = () => undefined,
  selected,
  selectAllToggle,
  allSelected,
}: Props) {
  const classes = useStyles();
  const [prevLength, setPrev] = useState(perPage || 10);
  const rootPath = useRootPath().slice(1); // Using hrefs, we need to remove
  const { templateUUID: uuid = '' } = useParams();
  const basePath = rootPath.replace('content', '');

  useEffect(() => {
    setPrev(systemsList.length || 10);
  }, [systemsList.length]);

  const columnHeaders = ['Name', 'Tags', 'OS', 'Template'];

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
        <Table aria-label='assign systems table' ouiaId='assign_systems_table' variant='compact'>
          <Hide hide={isLoadingOrZeroCount}>
            <Thead>
              <Tr>
                <Th
                  className={classes.fixLabelFontSize}
                  aria-label='select-all-box'
                  select={{
                    onSelect: () => selectAllToggle(),
                    isSelected: allSelected,
                  }}
                />
                {columnHeaders.map((columnHeader, index) => (
                  <Th key={columnHeader + '_column'} sort={sortParams && sortParams(index)}>
                    {columnHeader}
                  </Th>
                ))}
              </Tr>
            </Thead>
          </Hide>
          <Tbody>
            {systemsList.map(
              (
                { id, attributes: { display_name, tags, os, template_name, template_uuid } },
                rowIndex,
              ) => (
                <Tr key={id + rowIndex}>
                  <TdWithTooltip
                    className={classes.fixLabelFontSize}
                    show={template_uuid === uuid}
                    tooltipProps={{
                      content: `System '${display_name}' is already assigned to template '${template_name}'.`,
                      position: TooltipPosition.right,
                    }}
                    select={{
                      rowIndex,
                      isDisabled: template_uuid === uuid,
                      onSelect: () => setSelected(id),
                      isSelected: selected.has(id) || template_uuid === uuid,
                    }}
                  />
                  <Td>
                    <Button
                      isInline
                      variant='link'
                      component='a'
                      href={`${basePath}${PATCH_SYSTEMS_ROUTE}${id}`}
                    >
                      {reduceStringToCharsWithEllipsis(display_name)}
                    </Button>
                  </Td>
                  <Td className={tags.length ? '' : classes.forceDisabled}>
                    <TagIcon className={classes.rightMargin} />
                    {tags.length}
                  </Td>
                  <Td>{os}</Td>
                  <Td className={template_name ? '' : classes.forceDisabled}>
                    {template_name ? (
                      <Button
                        isInline
                        variant='link'
                        component='a'
                        href={`${rootPath}/${TEMPLATES_ROUTE}/${template_uuid}/${DETAILS_ROUTE}`}
                      >
                        {reduceStringToCharsWithEllipsis(template_name, 30)}
                      </Button>
                    ) : (
                      'No template'
                    )}
                  </Td>
                </Tr>
              ),
            )}
          </Tbody>
        </Table>
      </Hide>
    </>
  );
}
