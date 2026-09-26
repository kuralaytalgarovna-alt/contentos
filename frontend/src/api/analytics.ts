import { apiClient } from "./client";
import type { AnalyticsOverview } from "../types";

export async function getAnalyticsOverview(projectId: string): Promise<AnalyticsOverview> {
  const { data } = await apiClient.get<AnalyticsOverview>(`/projects/${projectId}/analytics/overview`);
  return data;
}

export async function downloadReportPdf(projectId: string): Promise<void> {
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
