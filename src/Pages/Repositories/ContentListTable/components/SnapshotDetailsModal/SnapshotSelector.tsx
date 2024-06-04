import { Form, FormGroup } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { useNavigate, useParams } from 'react-router-dom';
import { SelectVariant } from '@patternfly/react-core/deprecated';
import DropdownSelect from 'components/DropdownSelect_Deprecated/DropdownSelect_Deprecated';
import { useGetSnapshotList } from 'services/Content/ContentQueries';
import { useMemo } from 'react';
import useRootPath from 'Hooks/useRootPath';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { formatDateDDMMMYYYY } from 'helpers';

const useStyles = createUseStyles({
  mainContainer: {
    display: 'flex!important',
  },
});

export function SnapshotSelector() {
  const classes = useStyles();
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const { repoUUID: uuid = '', snapshotUUID = '' } = useParams();

  const {
    isLoading,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetSnapshotList(uuid as string, 1, 100, '', ''); // TODO: What do we do when a user has n+ snapshots?

  const [dateMapper, uuidMapper] = useMemo(() => {
    const dateMap = {};
    const uuidMap = {};
    data?.data.forEach(({ uuid, created_at }) => {
      const date = formatDateDDMMMYYYY(created_at, true);
      uuidMap[uuid] = date;
      dateMap[date] = uuid;
    });
    return [dateMap, uuidMap];
  }, [data?.data]);

  const setSelected = (selectedDate: string) => {
    navigate(`${rootPath}/${REPOSITORIES_ROUTE}/${uuid}/snapshots/${dateMapper[selectedDate]}`);
  };

  return (
    <Form isHorizontal>
      <FormGroup
        className={classes.mainContainer}
        label='Snapshots'
        aria-label='snapshot-selector'
        fieldId='snapshot'
      >
        <DropdownSelect
          isDisabled={isLoading || isFetching}
          ouiaId='snapshot_selector'
          menuAppendTo={document.body}
          toggleId='snapshotSelector'
          options={Object.keys(dateMapper)}
          variant={SelectVariant.single}
          selectedProp={uuidMapper[snapshotUUID]}
          setSelected={setSelected}
        />
      </FormGroup>
    </Form>
  );
}
