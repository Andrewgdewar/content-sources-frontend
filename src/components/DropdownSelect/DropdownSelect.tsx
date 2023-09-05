import { Select, SelectOption, SelectProps, SelectVariant } from '@patternfly/react-core';
import React, { Dispatch, SetStateAction, useState } from 'react';

interface DropdownSelectProps extends Partial<SelectProps> {
  options: Array<string>;
  variant: SelectVariant.single | SelectVariant.checkbox | SelectVariant.typeaheadMulti;
  selectedProp: any; // eslint-disable-line
  setSelected: Dispatch<SetStateAction<any>>; // eslint-disable-line
  toggleIcon?: React.ReactElement;
  placeholderText?: string | React.ReactNode;
  isDisabled?: boolean;
}

const DropdownSelect = ({
  options,
  variant,
  selectedProp,
  setSelected,
  toggleIcon,
  placeholderText,
  isDisabled,
  ...rest
}: DropdownSelectProps) => {
  const selected = Array.isArray(selectedProp) ? selectedProp : [selectedProp];
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = (isOpen) => setIsOpen(isOpen);

  const selectFrom = options.map((option, index) => (
    <SelectOption key={option + index} id={option} value={option} />
  ));

  const onSelect = (_event, selection) => {
    switch (variant) {
      case SelectVariant.single:
        setSelected(selection);
        setIsOpen(false);
        break;
      case SelectVariant.typeaheadMulti:
      case SelectVariant.checkbox:
        if (Array.isArray(selectedProp)) {
          if (selected.includes(selection)) {
            const remaining = selected.filter((item) => item !== selection);
            setSelected(remaining);
            break;
          }
          setSelected([...selected, selection]);
          break;
        }
        break;
    }
  };

  return (
    <Select
      isDisabled={isDisabled}
      variant={variant}
      onSelect={onSelect}
      selections={selected}
      isOpen={isOpen}
      onToggle={onToggle}
      placeholderText={placeholderText}
      isCheckboxSelectionBadgeHidden
      toggleIcon={toggleIcon}
      {...rest}
    >
      {selectFrom}
    </Select>
  );
};

export default DropdownSelect;
