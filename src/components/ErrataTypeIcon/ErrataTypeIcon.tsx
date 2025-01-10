import {
  BugIcon,
  EnhancementIcon,
  PackageIcon,
  SecurityIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';
import { useMemo } from 'react';

interface Props {
  type: string;
  iconProps?: SVGIconProps;
}

export default function ErrataTypeIcon({ type, iconProps }: Props) {
  const Icon = useMemo(() => {
    switch (type?.toLowerCase()) {
      case 'bugfix':
        return BugIcon;
      case 'newpackage':
        return PackageIcon;
      case 'enhancement':
        return EnhancementIcon;
      case 'security':
        return SecurityIcon;
      default:
        return UnknownIcon;
    }
  }, [type]);

  return <Icon {...iconProps} />;
}
