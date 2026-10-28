import client from './client';

export const getZones = () => client.get('/zones').then((r) => r.data);