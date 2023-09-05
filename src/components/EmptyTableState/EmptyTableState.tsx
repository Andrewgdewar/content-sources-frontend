import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Title,
  EmptyStateIcon,
  Button,
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
      <EmptyStateIcon icon={notFiltered ? PlusCircleIcon : SearchIcon} />
      <Title headingLevel='h2' size='lg' ouiaId='empty_custom_title'>
        {notFiltered ? `No ${itemName}` : `No ${itemName} match the filter criteria`}
      </Title>
      <EmptyStateBody className={classes.emptyStateBody}>
        {notFiltered ? notFilteredBody : 'Clear all filters to show more results'}
      </EmptyStateBody>
      {notFiltered ? (
        notFilteredButton
      ) : (
        <Button ouiaId='clear_filters' variant='link' onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </EmptyState>
  );
};

export default EmptyTableState;
