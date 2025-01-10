import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  Button,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon, PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  emptyStateContainer: {
    display: 'flex',
    flexGrow: 1,
  },
  emptyStateBody: {
    marginBottom: '16px',
  },
});

interface Props {
  notFiltered?: boolean;
  clearFilters: () => void;
  itemName: string;
  notFilteredBody?: string;
  notFilteredButton?: React.ReactNode;
}

const EmptyTableState = ({
  notFiltered,
  clearFilters,
  itemName,
  notFilteredBody,
  notFilteredButton,
}: Props) => {
  const classes = useStyles();
  return (
    <EmptyState variant={EmptyStateVariant.full} className={classes.emptyStateContainer}>
      <EmptyStateHeader
        titleText={
          <>{notFiltered ? `No ${itemName}` : `No ${itemName} match the filter criteria`}</>
        }
        icon={<EmptyStateIcon icon={notFiltered ? PlusCircleIcon : SearchIcon} />}
        headingLevel='h2'
      />
      <EmptyStateBody className={classes.emptyStateBody}>
        {notFiltered ? notFilteredBody : 'Clear all filters to show more results'}
      </EmptyStateBody>
      <EmptyStateFooter>
        {notFiltered ? (
          notFilteredButton
        ) : (
          <Button ouiaId='clear_filters' variant='link' onClick={clearFilters}>
            Clear all filters
          </Button>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default EmptyTableState;
