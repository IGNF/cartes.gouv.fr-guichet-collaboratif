import { useReportStore } from "@/store";

const useSearch = () => {
    const { searchReport, setSearchReport } = useReportStore();

    return {
        searchReport,
        setSearchReport,
    };
};

export default useSearch;
