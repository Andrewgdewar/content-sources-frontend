import { ExpandableSection, Flex, Grid, Text, TextVariants, Title } from '@patternfly/react-core';
import { useAddTemplateContext } from '../AddTemplateContext';
import { useMemo, useState } from 'react';
import { formatDateDDMMMYYYY } from 'helpers';

export default function ReviewStep() {
  const [expanded, setExpanded] = useState(new Set([0]));
  const {
    templateRequest,
    selectedRedhatRepos,
    hardcodedRedhatRepositoryUUIDS,
    selectedCustomRepos,
    distribution_arches,
    distribution_versions,
    isEdit,
  } = useAddTemplateContext();

  const archesDisplay = (arch?: string) =>
    distribution_arches.find(({ label }) => arch === label)?.name || 'Select architecture';

  const versionDisplay = (
    version?: string,
  ): string => // arm64 aarch64
    distribution_versions.find(({ label }) => version === label)?.name || 'Select version';

  const reviewTemplate = useMemo(() => {
    const { arch, version, date, name, description } = templateRequest;
    const review = {
      Content: {
        Architecture: archesDisplay(arch),
        'OS Version': versionDisplay(version),
        'Pre-selected RH Repositories': hardcodedRedhatRepositoryUUIDS.size,
        'Additional RH Repositories':
          selectedRedhatRepos.size - hardcodedRedhatRepositoryUUIDS.size,
        'Custom Repositories': selectedCustomRepos.size,
      },
      Date: {
        ...(templateRequest.use_latest
          ? { 'Snapshot date': 'Use latest content' }
          : { Date: formatDateDDMMMYYYY(date || '') }),
      },
      Details: {
        Name: name,
        Description: description,
      },
    } as Record<string, { [key: string]: string | number | undefined }>;

    return review;
  }, [templateRequest]);

  const setToggle = (index: number) => {
    if (expanded.has(index)) {
      expanded.delete(index);
    } else {
      expanded.add(index);
    }
    setExpanded(new Set(expanded));
  };

  return (
    <Grid hasGutter>
      <Title ouiaId='review' headingLevel='h1'>
        Review
      </Title>
      <Text component={TextVariants.h6}>
        Review the information and then click <b>{isEdit ? 'Confirm changes' : 'Create'}</b>.
      </Text>
      {Object.keys(reviewTemplate).map((key, index) => (
        <ExpandableSection
          key={key}
          isIndented
          toggleText={key}
          onToggle={() => setToggle(index)}
          isExpanded={expanded.has(index)}
          // displaySize='lg'
          aria-label={`${key}-expansion`}
          data-ouia-component-id={`${key}_expansion`}
        >
          <Flex direction={{ default: 'row' }}>
            <Flex direction={{ default: 'column' }}>
              {Object.keys(reviewTemplate[key]).map((title) => (
                <Text key={title + '' + index}>{title}</Text>
              ))}
            </Flex>
            <Flex direction={{ default: 'column' }}>
              {Object.values(reviewTemplate[key]).map((value, index) => (
                <Text key={value + '' + index}>{value}</Text>
              ))}
            </Flex>
          </Flex>
        </ExpandableSection>
      ))}
    </Grid>
  );
}
