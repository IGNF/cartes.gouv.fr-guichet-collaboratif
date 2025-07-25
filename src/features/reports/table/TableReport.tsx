import { Table } from "@codegouvfr/react-dsfr/Table";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";

import "./TableReport.scss";

const TableReport = () => {
    return (
        <>
            <Table
                bordered
                noCaption
                data={[["AAA", "BBB", "CCC", "DDD", "EEE"]]}
                fixed
                headers={["statut", "pseudo", "date de création", "commune (département)", "thème"]}
            />

            <div className="center-pagination">
                <Pagination
                    count={100}
                    defaultPage={2}
                    getPageLinkProps={(pageNumber: number) => ({
                        href: `#page=${pageNumber}`,
                        "aria-label": `Aller à la page ${pageNumber}`,
                    })}
                    showFirstLast
                />
            </div>
        </>
    );
};

export default TableReport;
