import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core/deprecated';
import { useState } from 'react';
import ConditionalTooltip from '../ConditionalTooltip/ConditionalTooltip';
import { useNavigate } from 'react-router-dom';
import { DELETE_ROUTE } from 'Routes/constants';

interface Props {
  atLeastOneRepoChecked: boolean;
  numberOfReposChecked: number;
  toggleOuiaId?: string;
  isDisabled?: boolean;
}

const DeleteKebab = ({
  atLeastOneRepoChecked,
  numberOfReposChecked,
  toggleOuiaId,
  isDisabled,
}: Props) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('delete-kebab') as HTMLElement;
    element.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const dropdownItems = [
    <ConditionalTooltip
      key='delete'
      content='Make a selection below to delete multiple repositories'
      show={!atLeastOneRepoChecked}
      setDisabled
    >
      <DropdownItem onClick={() => navigate(DELETE_ROUTE)}>
        {atLeastOneRepoChecked
          ? `Remove ${numberOfReposChecked} repositories`
          : 'Remove selected repositories'}
      </DropdownItem>
    </ConditionalTooltip>,
  ];

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={
        <KebabToggle
          id='delete-kebab'
          data-ouia-component-id={toggleOuiaId}
          onToggle={(_event, isOpen: boolean) => onToggle(isOpen)}
          isDisabled={isDisabled}
        />
      }
      isOpen={isOpen}
      isPlain
      dropdownItems={dropdownItems}
      direction='down'
    />
  );
};

export default DeleteKebab;
