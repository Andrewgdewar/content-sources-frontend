import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  Button,
  Bullseye,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons';
import { Td, Tr } from '@patternfly/react-table';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  emptyStateContainer: {
    display: 'flex',
    flexGrow: 1,
    margin: 'auto',
  },
});

interface Props {
  clearSearch: () => void;
}

export default function EmptyPackageState({ clearSearch }: Props) {
  const classes = useStyles();
  return (
    <Tr>
      <Td colSpan={4}>
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.full} className={classes.emptyStateContainer}>
            <EmptyStateHeader
              titleText='No packages match the search criteria'
              icon={<EmptyStateIcon icon={SearchIcon} />}
              headingLevel='h2'
            />
            <EmptyStateBody>Clear your current search to show more results</EmptyStateBody>
            <EmptyStateFooter>
              <Button ouiaId='clear_filters' variant='link' onClick={clearSearch}>
                Clear search
              </Button>
            </EmptyStateFooter>
          </EmptyState>
        </Bullseye>
      </Td>
    </Tr>
  );
}
