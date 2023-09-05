import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { useState } from 'react';
import { useAppContext } from '../../middleware/AppContext';
import ConditionalTooltip from '../ConditionalTooltip/ConditionalTooltip';

interface Props {
  atLeastOneRepoChecked: boolean;
  numberOfReposChecked: number;
  deleteCheckedRepos: () => void;
}

const DeleteKebab = ({
  atLeastOneRepoChecked,
  numberOfReposChecked,
  deleteCheckedRepos,
}: Props) => {
  const { rbac } = useAppContext();
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
      <DropdownItem onClick={deleteCheckedRepos}>
        {atLeastOneRepoChecked
          ? `Remove ${numberOfReposChecked} repositories`
          : 'Remove selected repositories'}
      </DropdownItem>
    </ConditionalTooltip>,
  ];

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={<KebabToggle id='delete-kebab' onToggle={onToggle} isDisabled={!rbac?.write} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={dropdownItems}
      direction='up'
    />
  );
};

export default DeleteKebab;
