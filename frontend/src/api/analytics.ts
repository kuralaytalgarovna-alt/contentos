import { apiClient } from "./client";
import { DEMO_MODE } from "../demoMode";
import * as demo from "../demo/mockApi";
import type { AnalyticsOverview } from "../types";

export async function getAnalyticsOverview(projectId: string): Promise<AnalyticsOverview> {
  if (DEMO_MODE) return demo.getAnalyticsOverview(projectId);
  const { data } = await apiClient.get<AnalyticsOverview>(`/projects/${projectId}/analytics/overview`);
  return data;
}

export async function downloadReportPdf(projectId: string): Promise<void> {
  if (DEMO_MODE) return demo.downloadReportPdf(projectId);
  const response = await apiClient.get(`/projects/${projectId}/analytics/report.pdf`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `contentos-report-${projectId}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
