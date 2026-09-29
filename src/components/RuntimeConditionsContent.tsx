import { useEntity } from '@backstage/plugin-catalog-react';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes-react';
import useAsync from 'react-use/esm/useAsync';
import {
  InfoCard,
  Table,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { deploymentsForEntity, fetchAllProfiles, RuntimeConditionsProfile } from '../profiles';
import { fetchFulfillments, FulfillmentRecord } from '../fulfillments';

interface ConditionRow {
  name?: string;
  kind: string;
  interfaceType: string;
  optional: string;
  fulfillmentCount: string;
  fulfillments: FulfillmentRecord[];
}

const ProfileCard = ({
  cluster,
  profile,
}: {
  cluster: string;
  profile: RuntimeConditionsProfile;
}) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const { value: fulfillments } = useAsync(
    () => fetchFulfillments(discoveryApi, fetchApi, profile.metadata.name),
    [profile.metadata.name],
  );

  const data: ConditionRow[] = profile.conditions.map(condition => {
    const conditionFulfillments = fulfillments?.filter(f => f.condition === condition.name) ?? [];
    return {
      name: condition.name,
      kind: condition.kind,
      interfaceType: condition.interface.type,
      optional: condition.optional ? 'yes' : 'no',
      fulfillmentCount:
        conditionFulfillments.length === 0
          ? 'none'
          : `${conditionFulfillments.length} environment${conditionFulfillments.length === 1 ? '' : 's'}`,
      fulfillments: conditionFulfillments,
    };
  });

  return (
    <InfoCard
      title={`Runtime Conditions: ${profile.metadata.name}`}
      subheader={`${profile.workload.uri} on ${cluster}`}
    >
      <p>Extensions: {profile.extensions.join(', ')}</p>
      <Table
        options={{ paging: false, search: false }}
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Kind', field: 'kind' },
          { title: 'Interface', field: 'interfaceType' },
          { title: 'Optional', field: 'optional' },
          { title: 'Fulfilled in', field: 'fulfillmentCount' },
        ]}
        data={data}
        detailPanel={({ rowData: { fulfillments: rowFulfillments } }: { rowData: ConditionRow }) =>
          rowFulfillments.length === 0 ? (
            <p style={{ margin: 16 }}>No fulfillments reported for this condition.</p>
          ) : (
            <ul style={{ margin: 16 }}>
              {rowFulfillments.map((f, i) => (
                <li key={i}>
                  <strong>{f.environment}</strong>: {f.resource.provider}/{f.resource.kind}:{' '}
                  {f.resource.reference}
                  {f.automation ? ` (via ${f.automation.tool})` : ''}
                </li>
              ))}
            </ul>
          )
        }
      />
    </InfoCard>
  );
};

export const RuntimeConditionsContent = () => {
  const { entity } = useEntity();
  const kubernetesApi = useApi(kubernetesApiRef);
  const { value, loading, error } = useAsync(
    () => fetchAllProfiles(kubernetesApi),
    [kubernetesApi],
  );

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  const deployments = deploymentsForEntity(value ?? [], entity);

  if (deployments.length === 0) {
    return (
      <InfoCard title="Runtime Conditions">
        No RuntimeConditionsProfile found for this component.
      </InfoCard>
    );
  }

  return (
    <>
      {deployments.map(({ cluster, profile }) => (
        <ProfileCard key={cluster} cluster={cluster} profile={profile} />
      ))}
    </>
  );
};
