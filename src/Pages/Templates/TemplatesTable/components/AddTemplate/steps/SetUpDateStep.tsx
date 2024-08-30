import {
  Alert,
  DatePicker,
  ExpandableSection,
  FlexItem,
  FormAlert,
  FormGroup,
  Grid,
  GridItem,
  Radio,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { useAddTemplateContext } from '../AddTemplateContext';
import { useContentListQuery, useGetSnapshotsByDates } from 'services/Content/ContentQueries';
import { useEffect, useMemo } from 'react';
import { global_Color_400 } from '@patternfly/react-tokens';
import Hide from 'components/Hide/Hide';
import { ContentItem, ContentOrigin } from 'services/Content/ContentApi';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { formatDateForPicker, reduceStringToCharsWithEllipsis } from 'helpers';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import PackageCount from 'Pages/Repositories/ContentListTable/components/PackageCount';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { useHref } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import dayjs from 'dayjs';

const useStyles = createUseStyles({
  snapshotInfoText: {
    color: global_Color_400.value,
    marginRight: '16px',
  },
  whatDoesItMean: {
    paddingTop: '16px',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
});

export default function SetUpDateStep() {
  const classes = useStyles();
  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';

  const { templateRequest, setTemplateRequest, selectedRedhatRepos, selectedCustomRepos } =
    useAddTemplateContext();

  const { data, mutateAsync } = useGetSnapshotsByDates(
    [...selectedRedhatRepos, ...selectedCustomRepos],
    templateRequest?.date || '',
  );

  const dateValidators = [
    (date: Date) => {
      if (date.getTime() > Date.now()) {
        return 'Cannot set a date in the future';
      }
      return '';
    },
  ];

  const dateIsValid = useMemo(
    () =>
      RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/).test(templateRequest?.date || ''),
    [templateRequest?.date],
  );

  useEffect(() => {
    if (
      templateRequest?.date &&
      dateIsValid &&
      [...selectedRedhatRepos, ...selectedCustomRepos].length
    ) {
      mutateAsync();
    }
  }, [selectedRedhatRepos.size, selectedCustomRepos.size, templateRequest?.date]);

  const columnHeaders = ['Name', /* 'Label',*/ 'Advisories', 'Packages'];

  const itemsAfterDate = useMemo(
    () => data?.data?.filter(({ is_after }) => is_after) || [],
    [data?.data],
  );

  const hasIsAfter = itemsAfterDate.length > 0;

  const { isLoading, data: contentData = { data: [], meta: { count: 0, limit: 20, offset: 0 } } } =
    useContentListQuery(
      1,
      100,
      {
        uuids: itemsAfterDate.map(({ repository_uuid }) => repository_uuid),
      },
      '',
      ContentOrigin.ALL,
    );

  return (
    <Grid hasGutter>
      <Title headingLevel='h1'>Set up snapshot date</Title>
      <FormGroup className={classes.radioGroup}>
        <Radio
          id='use latest snapshot radio'
          ouiaId='use-latest-snapshot-radio'
          name='use-latest-snapshot'
          label='Use latest content'
          description='Always use latest content from repositories.'
          isChecked={templateRequest.use_latest}
          onChange={() => {
            if (!templateRequest.use_latest) {
              setTemplateRequest((prev) => ({ ...prev, use_latest: true, date: '' }));
            }
          }}
        />
        <Radio
          id='use snapshot date radio'
          ouiaId='use-snapshot-date-radio'
          name='use-snapshot-date'
          label='Use a snapshot'
          description='Use content from snapshots up to a specific date.'
          isChecked={!templateRequest.use_latest}
          onChange={() => {
            if (templateRequest.use_latest) {
              setTemplateRequest((prev) => ({ ...prev, use_latest: false, date: '' }));
            }
          }}
        />
      </FormGroup>

      <Hide hide={!!templateRequest.use_latest}>
        <Title headingLevel='h1' size='xl'>
          Use a snapshot
        </Title>
        <Text component={TextVariants.h6}>
          This will include snapshots up to a specific date. Content of the snapshots created after
          the selected date will be displayed as applicable, not installable.
        </Text>
        <GridItem>
          <Text component={TextVariants.h6}>
            <b>Select date for snapshotted repositories</b>
          </Text>
        </GridItem>
        <FormGroup label='Include repository changes up to this date' required>
          <DatePicker
            value={formatDateForPicker(templateRequest.date)}
            required
            requiredDateOptions={{ isRequired: true }}
            validators={dateValidators}
            onChange={(_, val) => {
              setTemplateRequest((prev) => ({ ...prev, date: val }));
            }}
          />
          <Hide hide={!hasIsAfter || !dateIsValid}>
            <FormAlert style={{ paddingTop: '20px' }}>
              <Alert
                variant='warning'
                title='The items listed in the table below have snapshots after the selected date.'
                isInline
              />
            </FormAlert>
            <Hide hide={!isLoading}>
              <Grid className=''>
                <SkeletonTable
                  rows={10}
                  numberOfColumns={columnHeaders.length}
                  variant={TableVariant.compact}
                />
              </Grid>
            </Hide>
            <Hide hide={isLoading}>
              <Table aria-label='Set up date table' ouiaId='setup_date_table' variant='compact'>
                <Thead>
                  <Tr>
                    {columnHeaders.map((columnHeader) => (
                      <Th key={columnHeader + 'column'}>{columnHeader}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {contentData.data?.map((rowData: ContentItem) => {
                    const { uuid, name, url } = rowData;
                    return (
                      <Tr key={uuid}>
                        <Td>
                          <ConditionalTooltip show={name.length > 60} content={name}>
                            <>{reduceStringToCharsWithEllipsis(name, 60)}</>
                          </ConditionalTooltip>
                          <ConditionalTooltip show={url.length > 50} content={url}>
                            <UrlWithExternalIcon
                              href={url}
                              customText={reduceStringToCharsWithEllipsis(url)}
                            />
                          </ConditionalTooltip>
                          <Hide hide={!rowData?.last_snapshot?.created_at}>
                            <FlexItem className={classes.snapshotInfoText}>
                              Last snapshot {dayjs(rowData?.last_snapshot?.created_at).fromNow()}
                            </FlexItem>
                          </Hide>
                        </Td>
                        <Td>{rowData.last_snapshot?.content_counts?.['rpm.advisory'] || '-'}</Td>
                        <Td>
                          <PackageCount
                            rowData={rowData}
                            href={pathname + '/' + REPOSITORIES_ROUTE + `/${rowData.uuid}/packages`}
                            opensNewTab
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              <ExpandableSection
                toggleText='What does it mean?'
                aria-label='quickStart-expansion'
                data-ouia-component-id='quickstart_expand'
                className={classes.whatDoesItMean}
              >
                <TextContent>
                  <TextList>
                    <TextListItem>
                      No snapshots exist for these repositories on the specified date.
                    </TextListItem>
                    <TextListItem>The closest snapshots after that date will be used.</TextListItem>
                    <TextListItem>
                      Depending on the repository and time difference, this could cause a dependency
                      issue.
                    </TextListItem>
                  </TextList>
                </TextContent>
              </ExpandableSection>
            </Hide>
          </Hide>
        </FormGroup>
      </Hide>
    </Grid>
  );
}
