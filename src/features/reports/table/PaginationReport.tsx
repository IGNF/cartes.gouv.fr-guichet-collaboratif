import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { useReportStore } from "@/store";
import "./PaginationReport.css";

type PaginationReportProps = {
    totalPages: number;
    currentPage: number;
};

const PaginationReport = ({ totalPages, currentPage }: PaginationReportProps) => {
    const { setCurrentPage } = useReportStore();
    return (
        <div className="center-pagination">
            <Pagination
                key={currentPage}
                count={totalPages}
                defaultPage={currentPage || 1}
                getPageLinkProps={(pageNumber: number) => {
                    return {
                        href: `?page=${pageNumber}`,
                        "aria-label": `Aller à la page ${pageNumber}`,

                        onClick: (e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber);
                        },
                    };
                }}
                showFirstLast
            />
        </div>
    );
};

export default PaginationReport;
