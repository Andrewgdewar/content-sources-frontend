import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import EmptyPackageState from '../../../Pages/Repositories/ContentListTable/components/PackageModal/components/EmptyPackageState';
import { PackageItem } from '../../../services/Content/ContentApi';
import Hide from '../../Hide/Hide';
import { Grid } from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
});

interface Props {
  isFetchingOrLoading: boolean;
  isLoadingOrZeroCount: boolean;
  packagesList: PackageItem[];
  clearSearch: () => void;
  perPage: number;
}

export default function PackagesTable({
  isFetchingOrLoading,
  isLoadingOrZeroCount,
  packagesList,
  clearSearch,
  perPage,
}: Props) {
  const classes = useStyles();
  const columnHeaders = ['Name', 'Version', 'Release', 'Arch'];

  return (
    <>
      <Hide hide={!isFetchingOrLoading}>
        <Grid className={classes.mainContainer}>
          <SkeletonTable
            rows={perPage}
            numberOfColumns={columnHeaders.length}
            variant={TableVariant.compact}
          />
        </Grid>
      </Hide>
      <Hide hide={isFetchingOrLoading}>
        <Table aria-label='packages table' ouiaId='packages_table' variant='compact'>
          <Hide hide={isLoadingOrZeroCount}>
            <Thead>
              <Tr>
                {columnHeaders.map((columnHeader) => (
                  <Th key={columnHeader + '_column'}>{columnHeader}</Th>
                ))}
              </Tr>
            </Thead>
          </Hide>
          <Tbody>
            {packagesList.map(({ name, version, release, arch }: PackageItem, index: number) => (
              <Tr key={name + index}>
                <Td>{name}</Td>
                <Td>{version}</Td>
                <Td>{release}</Td>
                <Td>{arch}</Td>
              </Tr>
            ))}
            <Hide hide={!isLoadingOrZeroCount}>
              <EmptyPackageState clearSearch={clearSearch} />
            </Hide>
          </Tbody>
        </Table>
      </Hide>
    </>
  );
}
