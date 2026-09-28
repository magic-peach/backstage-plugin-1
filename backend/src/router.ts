import express, { Router } from 'express';
import { FulfillmentRecord } from './types';

function isValid(record: Partial<FulfillmentRecord>): record is FulfillmentRecord {
  return Boolean(
    record.profileName &&
      record.condition &&
      record.environment &&
      record.resource?.kind &&
      record.resource?.provider &&
      record.resource?.reference,
  );
}

export function createRouter(): Router {
  const router = Router();
  router.use(express.json());

  const fulfillments: FulfillmentRecord[] = [];

  router.post('/fulfillments', (req, res) => {
    const record = req.body as Partial<FulfillmentRecord>;
    if (!isValid(record)) {
      res.status(400).json({
        error:
          'profileName, condition, environment, and resource.kind/provider/reference are required',
      });
      return;
    }
    fulfillments.push(record);
    res.status(201).json(record);
  });

  router.get('/fulfillments', (req, res) => {
    const { profileName, condition } = req.query;
    res.json(
      fulfillments.filter(
        f =>
          (!profileName || f.profileName === profileName) &&
          (!condition || f.condition === condition),
      ),
    );
  });

  return router;
}
