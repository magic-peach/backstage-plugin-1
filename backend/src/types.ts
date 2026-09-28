export interface FulfillingResource {
  kind: string;
  provider: string;
  reference: string;
  componentRef?: string;
}

export interface FulfillingAutomation {
  tool: string;
  reference?: string;
}

export interface FulfillmentRecord {
  profileName: string;
  profileNamespace?: string;
  condition: string;
  environment: string;
  resource: FulfillingResource;
  automation?: FulfillingAutomation;
}
