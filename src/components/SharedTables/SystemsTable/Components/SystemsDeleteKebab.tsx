import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core/deprecated';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { useState } from 'react';

interface Props {
  selected: string[];
  deselectAll: () => void;
  deleteFromSystems: (items: string[]) => void;
  isDisabled?: boolean;
}

const SystemsDeleteKebab = ({ deselectAll, isDisabled, selected, deleteFromSystems }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = () => {
    setIsOpen(false);
    deselectAll();
  };

  const dropdownItems = [
    <ConditionalTooltip
      key='delete'
      content='Make a selection below to remove this template from multiple systems'
      show={!selected.length}
      setDisabled
    >
      <DropdownItem autoFocus onClick={() => deleteFromSystems(selected)}>
        {`Remove template from ${selected.length} system(s)`}
      </DropdownItem>
    </ConditionalTooltip>,
  ];

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={
        <KebabToggle
          id='delete-kebab'
          data-ouia-component-id='template_systems_kebab_toggle'
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

export default SystemsDeleteKebab;
