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
                    getPageLinkProps={(pageNumber: number) => {
                        // Clone current params
                        const params = new URLSearchParams(searchParams.toString());
                        // Change only page param
                        params.set("page", pageNumber.toString());
                        return {
                            href: `?page=${pageNumber}+?${params.toString()}`,
                            "aria-label": `Aller à la page ${pageNumber}`,

                            onClick: (e) => {
                                e.preventDefault();
                                setSearchParams(params);
                            },
                        };
                    }}
                    showFirstLast
                />
            </div>
        </>
    );
};

export default PaginationReport;
