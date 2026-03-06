import { ReportedPost } from "@/types/ReportedPost";
import { create } from "zustand";

interface ReportStore {
  reports: ReportedPost[] | null;
  setReports: (reports: ReportedPost[]) => void;
  updateReportStatus: (postId: string, reportId: string, newStatus: "pending" | "resolved" | "ignored") => void;
  updateReport: (updatedReport: ReportedPost["reports"][number], id: string) => void;
}

const useReportStore = create<ReportStore>((set) => ({
  reports: null,
  setReports: (reports) => set({ reports }),
  updateReportStatus: (postId, reportId, newStatus) =>
    set((state) => ({
      reports: state.reports?.map((post) =>
        post.targetDetails.id === postId
          ? {
            ...post,
            reports: post.reports.map((report) =>
              report.id === reportId ? { ...report, status: newStatus } : report
            ),
          }
          : post
      ) || [],
    })),
  updateReport: (updatedReport, id) =>
    set((state) => {
      const reports = state.reports?.map((post) => {
        const reportIndex = post.reports.findIndex((r) => r.id === id);
        if (reportIndex !== -1) {
          const updatedReports = [...post.reports];
          updatedReports[reportIndex] = updatedReport;
          return { ...post, reports: updatedReports };
        }
        return post;
      });
      return { reports: reports || [] };
    }),
}));

export default useReportStore;
