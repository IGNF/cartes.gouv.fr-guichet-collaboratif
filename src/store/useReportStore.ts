import { CommunityTheme } from "@/constants/communities/types";
import { CommunityReport, FilterState, PostThemeReport, SortType } from "@/constants/reports/types";
import { getThemeAttributes } from "@/constants/utils";
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
    sortOrder: "ASC" | "DESC" | undefined;
    sortBy: string;
    setSortBy: (sortBy: string) => void;
    setSortOrder: (order: "ASC" | "DESC") => void;
    toggleSortByDateCreation: (order?: "ASC" | "DESC") => void;
    drawerOpened: boolean;
    setDrawerOpened: (drawerOpened: boolean) => void;
    responseDrawerOpened: boolean;
    setResponseDrawerOpened: (responseDrawerOpened: boolean) => void;
    hideToolsDiv?: boolean;

    formData: {
        theme: CommunityTheme | null;
        themeAttributes: PostThemeReport;
        description: string;
        files: File[];
    };
    resetForm: (report?: CommunityReport) => void;
    updateTheme: (theme: CommunityTheme | null, attributes: PostThemeReport) => void;
    updateDescription: (description: string) => void;
    updateFiles: (files: File[]) => void;
    clearFiles: () => void;
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
    currentFilters: { status: "", theme: "", author: null, departement: "" },
    setCurrentFilters: (filters) => set({ currentFilters: filters, currentPage: 1 }),
    currentPage: 1,
    setCurrentPage: (currentPage) => set({ currentPage }),
    limitPerPage: 10,
    setLimitPerPage: (limitPerPage: number) => set({ limitPerPage }),
    reportTableWidth: window.innerWidth * (2 / 3),
    setReportTableWidth: (reportTableWidth: number) => set({ reportTableWidth }),
    selectedLine: 0,
    setSelectedLine: (selectedLine: number) => set({ selectedLine }),
    sortOrder: undefined,
    sortBy: "",
    setSortBy: (sortBy) => set({ sortBy }),
    setSortOrder: (order) => set({ sortOrder: order }),
    toggleSortByDateCreation: (order) => {
        const { sortOrder, setSortBy, setCurrentPage, setSortOrder } = get();
        const newOrder = order ?? (sortOrder === SortType.ASC ? SortType.DESC : SortType.ASC);
        setSortBy(`opening_date:${newOrder}`);
        setCurrentPage(1);
        setSortOrder(newOrder);
    },
    drawerOpened: false,
    setDrawerOpened: (drawerOpened: boolean) => set({ drawerOpened }),
    responseDrawerOpened: false,
    setResponseDrawerOpened: (responseDrawerOpened: boolean) => set({ responseDrawerOpened }),
    hideToolsDiv: false,

    formData: { theme: null, themeAttributes: {}, description: "", files: [] },

    resetForm: (report) => {
        if (report) {
            set({
                formData: {
                    theme: report.themes[0] || null,
                    themeAttributes: getThemeAttributes(report.themes[0]),
                    description: report.comment || "",
                    files: [],
                },
            });
        } else {
            set({ formData: { theme: null, themeAttributes: {}, description: "", files: [] } });
        }
    },

    updateTheme: (theme, attributes) => set({ formData: { ...get().formData, theme, themeAttributes: attributes } }),

    updateDescription: (description: string) => set({ formData: { ...get().formData, description } }),

    updateFiles: (files: File[]) => set({ formData: { ...get().formData, files } }),

    clearFiles: () => set({ formData: { ...get().formData, files: [] } }),
}));
