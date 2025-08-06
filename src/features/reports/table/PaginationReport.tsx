import { SetURLSearchParams } from "react-router-dom";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";

import "./PaginationReport.css";

type PaginationReportProps = {
    totalPage: number;
    searchParams: URLSearchParams;
    setSearchParams: SetURLSearchParams;
};

const PaginationReport = ({ totalPage, searchParams, setSearchParams }: PaginationReportProps) => {
    return (
        <>
            <div className="center-pagination">
                <Pagination
                    count={totalPage}
                    defaultPage={Number(searchParams.get("page")) || 1}
                    getPageLinkProps={(pageNumber: number) => ({
                        href: `?page=${pageNumber}`,
                        "aria-label": `Aller à la page ${pageNumber}`,

                        onClick: (e) => {
                            e.preventDefault();
                            setSearchParams({ page: pageNumber.toString() });
                        },
                    })}
                    showFirstLast
                />
            </div>
        </>
    );
};

export default PaginationReport;
