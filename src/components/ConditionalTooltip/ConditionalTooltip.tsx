import { Tooltip, TooltipProps } from '@patternfly/react-core';
import { cloneElement } from 'react';

interface Props extends TooltipProps {
  show: boolean;
  setDisabled?: boolean;
}

const ConditionalTooltip = ({ show, children, setDisabled, ...rest }: Props) =>
  show ? (
    <Tooltip {...rest}>
      <div>
        {children && cloneElement(children, setDisabled ? { isDisabled: setDisabled } : undefined)}
      </div>
    </Tooltip>
  ) : (
    <div>{children}</div>
  );

export default ConditionalTooltip;
