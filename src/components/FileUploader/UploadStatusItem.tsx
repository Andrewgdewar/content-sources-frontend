import * as React from 'react';
import styles from '@patternfly/react-styles/css/components/MultipleFileUpload/multiple-file-upload';
import { css } from '@patternfly/react-styles';
import FileIcon from '@patternfly/react-icons/dist/esm/icons/file-icon';
import { Button, Flex, Progress } from '@patternfly/react-core';
import { reduceStringToCharsWithEllipsis } from 'helpers';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { createUseStyles } from 'react-jss';
import { global_danger_color_100 } from '@patternfly/react-tokens';
import { TimesIcon } from '@patternfly/react-icons';
import Hide from 'components/Hide/Hide';

const useStyles = createUseStyles({
  statusMinWidth: {
    width: '530px',
  },
  spaceBetween: {
    width: '450px',
    justifyContent: 'space-between',
  },
  errorText: {
    '& .pf-v5-c-progress__helper-text': {
      color: global_danger_color_100.value,
    },
  },
  noPadding: {
    padding: 0,
  },
});

export interface MultipleFileUploadStatusItemProps extends React.HTMLProps<HTMLLIElement> {
  className?: string;
  buttonAriaLabel?: string;
  onClearClick?: React.MouseEventHandler<HTMLButtonElement>;
  deleteButtonDisabled?: boolean;
  fileIcon?: React.ReactNode;
  fileName: string;
  maxFileNameLength?: number;
  fileSize?: number;
  progressValue: number;
  progressVariant?: 'danger' | 'success' | 'warning';
  progressAriaLabel?: string;
  progressAriaLabelledBy?: string;
  progressAriaLiveMessage?: string | ((loadPercentage: number) => string);
  progressId?: string;
  progressHelperText?: React.ReactNode;
  retry?: () => void;
}

export default function UploadStatusItem({
  retry,
  className,
  fileIcon,
  onClearClick = () => {},
  deleteButtonDisabled,
  fileName,
  maxFileNameLength = 50,
  fileSize,
  progressValue,
  progressVariant,
  progressAriaLabel,
  progressAriaLabelledBy,
  progressId,
  progressAriaLiveMessage,
  buttonAriaLabel = 'Remove from list',
  progressHelperText,
  ...props
}: MultipleFileUploadStatusItemProps) {
  const classes = useStyles();
  const getHumanReadableFileSize = (size: number) => {
    const prefixes = ['', 'K', 'M', 'G', 'T'];
    let prefixUnit = 0;
    while (size >= 1000) {
      prefixUnit += 1;
      size = size / 1000;
    }

    if (prefixUnit >= prefixes.length) {
      return 'File size too large';
    }

    return `${Math.round(size)}${prefixes[prefixUnit]}B`;
  };

  return (
    <li className={css(styles.multipleFileUploadStatusItem, className)} {...props}>
      <div className={styles.multipleFileUploadStatusItemIcon}>{fileIcon || <FileIcon />}</div>
      <div className={styles.multipleFileUploadStatusItemMain + ' ' + classes.statusMinWidth}>
        <div className='pf-v5-screen-reader' aria-live='polite'>
          {progressAriaLiveMessage &&
            typeof progressAriaLiveMessage === 'string' &&
            progressAriaLiveMessage}
          {!progressAriaLiveMessage && `Progress value is ${progressValue}%.`}
        </div>
        <Progress
          className={progressVariant === 'danger' ? classes.errorText : ''}
          title={
            <span
              className={styles.multipleFileUploadStatusItemProgress + ' ' + classes.spaceBetween}
            >
              <ConditionalTooltip show={fileName.length > maxFileNameLength} content={fileName}>
                <span className={styles.multipleFileUploadStatusItemProgressText}>
                  {reduceStringToCharsWithEllipsis(fileName, maxFileNameLength) || ''}
                </span>
              </ConditionalTooltip>
              <span className={styles.multipleFileUploadStatusItemProgressSize}>
                {getHumanReadableFileSize(fileSize || 0)}
              </span>
            </span>
          }
          value={progressValue}
          variant={progressVariant}
          aria-label={progressAriaLabel}
          aria-labelledby={progressAriaLabelledBy}
          id={progressId}
          helperText={progressHelperText}
        />
      </div>

      <Flex direction={{ default: 'column' }} className={styles.multipleFileUploadStatusItemClose}>
        <Button
          isDisabled={deleteButtonDisabled}
          variant='plain'
          isDanger
          aria-label={buttonAriaLabel}
          onClick={onClearClick}
        >
          <TimesIcon />
        </Button>
        <Hide hide={!retry || progressVariant !== 'danger'}>
          <Button className={classes.noPadding} variant='link' onClick={retry}>
            Retry
          </Button>
        </Hide>
      </Flex>
    </li>
  );
}
