import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export interface FulfillmentRecord {
  profileName: string;
  profileNamespace?: string;
  condition: string;
  environment: string;
  resource: {
    kind: string;
    provider: string;
    reference: string;
    componentRef?: string;
  };
  automation?: { tool: string; reference?: string };
}

export async function fetchFulfillments(
  discoveryApi: DiscoveryApi,
  fetchApi: FetchApi,
  profileName: string,
): Promise<FulfillmentRecord[]> {
  const baseUrl = await discoveryApi.getBaseUrl('runtime-conditions');
  const response = await fetchApi.fetch(
    `${baseUrl}/fulfillments?profileName=${encodeURIComponent(profileName)}`,
  );
  if (!response.ok) return [];
  return response.json();
}
