import {
  Select,
  MenuToggle,
  MenuToggleProps,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  type SelectProps,
} from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { useState, type ReactNode } from 'react';

const useStyles = createUseStyles({
  menuToggle: {
    maxWidth: 'unset!important', // Remove arbitrary button width
  },
});

export interface DropDownSelectProps extends Omit<SelectProps, 'toggle'> {
  menuValue?: string | ReactNode;
  dropDownItems?: SelectOptionProps[];
  isDisabled?: boolean;
  multiSelect?: boolean; // Prevents close behaviour on select
  menuToggleProps?: Partial<MenuToggleProps | unknown>;
}

// Use with checkboxes
export default function DropdownSelect({
  onSelect = () => undefined,
  dropDownItems = [],
  menuValue,
  isDisabled,
  multiSelect,
  menuToggleProps,
  ouiaId,
  ...rest
}: DropDownSelectProps) {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className='pf-v5-c-select'
      data-ouia-component-type='PF5/Select'
      data-ouia-safe={true}
      data-ouia-component-id={ouiaId}
      // This is necessary to have both the 'pf-v5-c-select' above for QE and no styles applied
      style={{ all: 'unset' }}
    >
      <Select
        isOpen={isOpen}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            isFullWidth
            isExpanded={isOpen}
            className={classes.menuToggle}
            onClick={onToggleClick}
            isDisabled={isDisabled}
            {...menuToggleProps}
          >
            {menuValue}
          </MenuToggle>
        )}
        onSelect={(_, value) => {
          onSelect(_, value);
          if (!multiSelect) setIsOpen(false);
        }}
        {...rest}
      >
        <SelectList>
          {dropDownItems.map(({ label, ...props }, index) => (
            <SelectOption key={label || '' + index} {...props} />
          ))}
        </SelectList>
      </Select>
    </div>
  );
}
