import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleProps,
  type DropdownItemProps,
  type DropdownProps,
} from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { useState } from 'react';

const useStyles = createUseStyles({
  menuToggle: {
    maxWidth: 'unset!important', // Remove arbitrary button width
  },
});

export interface DropDownMenuProps extends Omit<DropdownProps, 'toggle'> {
  menuValue: string;
  dropDownItems?: DropdownItemProps[];
  isDisabled?: boolean;
  multiSelect?: boolean; // Prevents close behaviour on select
  menuToggleProps?: Partial<MenuToggleProps | unknown>;
}

export default function DropdownMenu({
  onSelect = () => undefined,
  dropDownItems = [],
  menuValue,
  isDisabled,
  multiSelect,
  menuToggleProps,
  ...rest
}: DropDownMenuProps) {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      role='menu'
      isRootMenu
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
      <DropdownList>
        {dropDownItems.map(({ label, ...props }, index) => (
          <DropdownItem role='menuitem' key={label || '' + index} {...props} />
        ))}
      </DropdownList>
    </Dropdown>
  );
}
