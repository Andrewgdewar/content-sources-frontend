import { AlertVariant } from '@patternfly/react-core';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useDispatch } from 'react-redux';

export interface NotificationPayload {
  title: React.ReactNode | string;
  variant: AlertVariant;
  description?: React.ReactNode | string;
  dismissable?: boolean;
}

export const useNotification = () => {
  const dispatch = useDispatch();
  const notify: (payload: NotificationPayload) => void = (payload: NotificationPayload) => dispatch(addNotification(payload));

  return { notify };
};
