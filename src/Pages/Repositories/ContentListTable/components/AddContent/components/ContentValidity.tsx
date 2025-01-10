import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { FormikErrors, FormikTouched } from 'formik';
import { global_success_color_100, global_danger_color_100 } from '@patternfly/react-tokens';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { createUseStyles } from 'react-jss';

const red = global_danger_color_100.value;
const green = global_success_color_100.value;

const useStyles = createUseStyles({
  red: { color: red, fontWeight: 'bold', fontSize: '14px' },
  green: { color: green, fontWeight: 'bold', fontSize: '14px' },
});

interface Props {
  touched?: FormikTouched<{
    name: string;
    url: string;
    gpgKey: string;
    gpgLoading: boolean;
    expanded: boolean;
  }>;
  errors?: FormikErrors<{
    name: string;
    url: string;
    gpgKey: string;
    gpgLoading: boolean;
    expanded: boolean;
  }>;
  loading?: boolean;
}

const ContentValidity = ({ touched, errors, loading }: Props) => {
  const classes = useStyles();
  const required = ['name', 'url'];
  const allTouched = required.every((val) => touched?.[val]);
  const noErrors = Object.values(errors || {}).every((val) => !val);
  const hasTouchedError = Object.keys(touched || {})
    .filter((key) => !!touched?.[key])
    .some((key) => errors?.[key]);

  switch (true) {
    case loading:
      return <Spinner size='md' />;
    case allTouched && noErrors:
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <CheckCircleIcon color={green} />
          </FlexItem>
          <FlexItem>
            <span className={classes.green}>Valid</span>
          </FlexItem>
        </Flex>
      );
    case hasTouchedError:
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <ExclamationCircleIcon color={red} />
          </FlexItem>
          <FlexItem>
            <span className={classes.red}>Invalid</span>
          </FlexItem>
        </Flex>
      );
    default:
      return <></>;
  }
};

export default ContentValidity;
