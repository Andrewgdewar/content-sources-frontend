import axios from 'axios';

export interface Feature {
  enabled: boolean;
  accessible: boolean;
}

export interface Features {
  snapshots?: Feature;
  admintasks?: Feature;
}

export const getFeatures: () => Promise<Features> = async () => {
  const { data } = await axios.get('/api/content-sources/v1/features/');
  return data;
};
