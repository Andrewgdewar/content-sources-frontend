import { Tooltip, TooltipProps } from '@patternfly/react-core';
import { Td, TdProps } from '@patternfly/react-table';
import { useRef } from 'react';
import Hide from '../Hide/Hide';

interface Props extends TdProps {
  tooltipProps: TooltipProps;
  show?: boolean;
}

const TdWithTooltip = ({ tooltipProps, show, ...props }: Props) => {
  const tooltipRef = useRef(null);
  return (
    <>
      <Td {...props} ref={tooltipRef} />
      <Hide hide={!show}>
        <Tooltip triggerRef={tooltipRef} {...tooltipProps} />
      </Hide>
    </>
  );
};

export default TdWithTooltip;
