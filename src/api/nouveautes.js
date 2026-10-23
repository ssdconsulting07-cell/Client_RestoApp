import client from './client';

export const getNouveautes = () =>
  client.get('/nouveautes?active=true').then((r) => r.data);