import { mockReports } from '../data/mockReports.js';

export async function mockAnalyze(formData) {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return mockReports["r001"];
}
