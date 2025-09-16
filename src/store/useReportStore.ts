import { CommunityReport, FilterState } from "@/constants/reports/types";
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
    filteredReports: CommunityReport[];
    isFiltered: boolean;
    setFilteredReports: (reports: CommunityReport[], isFiltered: boolean) => void;
    searchReport: string;
    setSearchReport: (searchReport: string) => void;
    isChecked: Record<string, boolean>;
    setIsChecked: (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
    currentFilters: FilterState;
    setCurrentFilters: (filters: FilterState) => void;
    currentPage: number;
    setCurrentPage: (currentPage: number) => void;
    limitPerPage: number;
    setLimitPerPage: (limitPerPage: number) => void;
    reportTableWidth: number;
    setReportTableWidth: (reportTableWidth: number) => void;
    selectedLine: number;
    setSelectedLine: (selectedLine: number) => void;
    sortBy: string | undefined;
    setSortBy: (sortBy: string) => void;
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
    searchReport: "",
    setSearchReport: (searchReport: string) => set({ searchReport }),
    isChecked: {},
    setIsChecked: (updater) =>
        set((state) => ({
            isChecked: typeof updater === "function" ? updater(state.isChecked) : updater,
        })),
    currentFilters: { status: "", theme: "", author: null, department: "" },
    setCurrentFilters: (filters) => set({ currentFilters: filters, currentPage: 1 }),
    currentPage: 1,
    setCurrentPage: (currentPage) => set({ currentPage }),
    limitPerPage: 10,
    setLimitPerPage: (limitPerPage: number) => set({ limitPerPage }),
    reportTableWidth: window.innerWidth * (2 / 3),
    setReportTableWidth: (reportTableWidth: number) => set({ reportTableWidth }),
    selectedLine: 0,
    setSelectedLine: (selectedLine: number) => set({ selectedLine }),
    sortBy: undefined,
    setSortBy: (sortBy) => set({ sortBy }),
}));
