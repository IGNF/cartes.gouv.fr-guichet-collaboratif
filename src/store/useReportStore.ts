import { CommunityReport, GetReportData } from "@/constants/reports/types";
import { Feature } from "ol";
import { create } from "zustand";

interface ReportStore {
    reports: CommunityReport[];
    selectedReport: CommunityReport | null;
    selectedFeatures: Feature[];
    editReport: boolean;
    tableDrawerOpened: boolean;
    setReports: (reports: CommunityReport[], shouldReset?: boolean) => void;
    setEditReport: (edit: boolean) => void;
    setSelectedReport: (report: CommunityReport | null) => void;
    setSelectedFeatures: (features: Feature[]) => void;
    isShowReport: () => boolean;
    setTableDrawerOpened: (open: boolean) => void;
    filteredReports: GetReportData[];
    isFiltered: boolean;
    setFilteredReports: (reports: GetReportData[], isFiltered: boolean) => void;
}

export const useReportStore = create<ReportStore>((set, get) => ({
    reports: [],
    selectedReport: null,
    selectedFeatures: [],
    editReport: false,
    tableDrawerOpened: false,
    setReports: (reports, shouldReset = false) => {
        if (shouldReset) {
            set(() => {
                return {
                    reports,
                };
            });
        } else {
            const oldReports = get().reports;
            const newReports = reports.filter((item) => !oldReports.find((r) => r.id === item.id));
            const allReports = [...oldReports, ...newReports];
            set(() => {
                return {
                    reports: allReports,
                };
            });
        }
    },
    setEditReport: (edit) => {
        set({ editReport: edit });
    },
    setSelectedReport: (report) => {
        set({ selectedReport: report });
    },
    setSelectedFeatures: (features) => {
        set({ selectedFeatures: features });
    },
    isShowReport: () => {
        return !!get().selectedReport && !get().editReport;
    },
    setTableDrawerOpened: (open) => set({ tableDrawerOpened: open }),
    filteredReports: [],
    setFilteredReports: (reports, isFiltered = false) => set({ filteredReports: reports, isFiltered }),
    isFiltered: false,
}));
