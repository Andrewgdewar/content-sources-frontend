import { AlertVariant } from '@patternfly/react-core';
import useNotification from './useNotification';

export default function useErrorNotification() {
  const { notify } = useNotification();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorNotifier = (defaultTitle: string, defaultDescription: string, err: any) => {
    let title = defaultTitle;
    let description = defaultDescription;

    switch (typeof err?.response?.data) {
      case 'string':
        description = err.response.data;
        break;
      case 'object':
        // Only show the first error
        err?.response?.data.errors?.find(
          ({ title: errTitle, detail, description: errDescription }) => {
            if (errTitle) title = errTitle;
            if (errDescription) description = errDescription;
            if (detail) description = detail;
            if (errTitle || errDescription || detail) return true;
          },
        );
        break;
      default:
        break;
    }

    notify({
      variant: AlertVariant.danger,
      title,
      description,
    });
  };

  return errorNotifier;
}
