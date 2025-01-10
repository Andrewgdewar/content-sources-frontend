import { Flex, FlexItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import RepoConfig from './RepoConfig';

interface Props {
  repoUUID: string;
}

const LatestRepoConfig = ({ repoUUID }: Props) => (
  <Flex>
    <FlexItem>
      <TextContent>
        <Text component={TextVariants.p}>Latest Snapshot Config:</Text>
      </TextContent>
    </FlexItem>
    <FlexItem>
      <RepoConfig repoUUID={repoUUID} snapUUID='' latest />
    </FlexItem>
  </Flex>
);

export default LatestRepoConfig;
