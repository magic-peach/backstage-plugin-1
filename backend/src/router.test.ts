import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { FulfillmentRecord } from './types';

const record: FulfillmentRecord = {
  profileName: 'request-coordinator',
  condition: 'available-stock-capability',
  environment: 'dev',
  resource: {
    kind: 'CiliumNetworkPolicy',
    provider: 'kubernetes',
    reference: 'rc-cilium/applications/request-coordinator-egress',
    componentRef: 'component:default/request-coordinator',
  },
  automation: { tool: 'kratix', reference: 'runtime-conditions-profile' },
};

describe('createRouter', () => {
  it('rejects a fulfillment missing required fields', async () => {
    const app = express().use(createRouter());
    const res = await request(app).post('/fulfillments').send({ profileName: 'x' });
    expect(res.status).toBe(400);
  });

  it('registers a fulfillment and lists it back, filtered by profile and condition', async () => {
    const app = express().use(createRouter());

    const created = await request(app).post('/fulfillments').send(record);
    expect(created.status).toBe(201);
    expect(created.body).toEqual(record);

    const all = await request(app).get('/fulfillments');
    expect(all.body).toEqual([record]);

    const noMatch = await request(app).get('/fulfillments').query({ profileName: 'other' });
    expect(noMatch.body).toEqual([]);

    const match = await request(app)
      .get('/fulfillments')
      .query({ profileName: record.profileName, condition: record.condition });
    expect(match.body).toEqual([record]);
  });
});
