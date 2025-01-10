import {
  ExpandableSection,
  FormGroup,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { useAddTemplateContext } from '../AddTemplateContext';
import DropdownSelect from 'components/DropdownSelect/DropdownSelect';
import { global_Color_300 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';

const useStyles = createUseStyles({
  global_300: {
    color: global_Color_300.value,
  },
});

export default function DefineContentStep() {
  const classes = useStyles();
  const {
    isEdit,
    templateRequest,
    setTemplateRequest,
    distribution_versions,
    distribution_arches,
  } = useAddTemplateContext();

  const archesDisplay = (arch?: string) =>
    distribution_arches.find(({ label }) => arch === label)?.name || 'Select architecture';

  const versionDisplay = (
    version?: string,
  ): string => // arm64 aarch64
    distribution_versions.find(({ label }) => version === label)?.name || 'Select version';

  const allowedDistributionarches = distribution_arches
    .filter(({ label }) => ['x86_64', 'aarch64'].includes(label))
    .map(({ label, name }) => ({ value: label, children: name }));

  const allowedDistributionVersions = distribution_versions
    .filter(({ label }) => ['8', '9'].includes(label))
    .map(({ label, name }) => ({ value: label, children: name }));

  return (
    <Grid hasGutter>
      <Title ouiaId='define_template_content' headingLevel='h1'>
        Define template content
      </Title>
      <Text component={TextVariants.h6}>
        Templates provide consistent content across environments and time by enabling you to control
        the scope of package and advisory updates to be installed on selected systems.
      </Text>
      <GridItem>
        <Text component={TextVariants.h6}>
          <b>Preselect available content</b>
        </Text>
        <Text component={TextVariants.h6} className={classes.global_300}>
          Based on your filters, the base repositories will be added to this template.
        </Text>
      </GridItem>
      <FormGroup label='Architecture' isRequired>
        <ConditionalTooltip
          position='top-start'
          content='Architecture cannot be changed after creation'
          show={!!isEdit}
          setDisabled
        >
          <DropdownSelect
            onSelect={(_, value) =>
              setTemplateRequest((prev) => ({ ...prev, arch: value as string }))
            }
            dropDownItems={allowedDistributionarches}
            menuValue={archesDisplay(templateRequest?.arch)}
            ouiaId='restrict_to_architecture'
          />
        </ConditionalTooltip>
      </FormGroup>
      <FormGroup label='OS Version' isRequired>
        <ConditionalTooltip
          position='top-start'
          content='OS Version cannot be changed after creation'
          show={!!isEdit}
          setDisabled
        >
          <DropdownSelect
            onSelect={(_, value) =>
              setTemplateRequest((prev) => ({ ...prev, version: value as string }))
            }
            dropDownItems={allowedDistributionVersions}
            menuValue={versionDisplay(templateRequest?.version)}
            ouiaId='restrict_to_os_version'
          />
        </ConditionalTooltip>
      </FormGroup>
      <ExpandableSection
        toggleText='What does it mean?'
        aria-label='quickStart-expansion'
        data-ouia-component-id='quickstart_expand'
      >
        <TextContent>
          <TextList>
            <TextListItem>
              Configures clients to use date-based snapshots of Red Hat and Custom repositories.
            </TextListItem>
            <TextListItem>Use third party tooling to update systems.</TextListItem>
            {/* <TextListItem>Build Images from date based repository snapshots.</TextListItem> */}
          </TextList>
        </TextContent>
      </ExpandableSection>
    </Grid>
  );
}
