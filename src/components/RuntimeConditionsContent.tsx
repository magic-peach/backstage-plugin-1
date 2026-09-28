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
import { fetchFulfillments } from '../fulfillments';

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
          { title: 'Fulfilled by', field: 'fulfilledBy' },
        ]}
        data={profile.conditions.map(condition => {
          const fulfillment = fulfillments?.find(f => f.condition === condition.name);
          return {
            name: condition.name,
            kind: condition.kind,
            interfaceType: condition.interface.type,
            optional: condition.optional ? 'yes' : 'no',
            fulfilledBy: fulfillment
              ? `${fulfillment.resource.provider}/${fulfillment.resource.kind}: ${fulfillment.resource.reference}`
              : '—',
          };
        })}
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
