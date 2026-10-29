import { StatusKey } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";

const ReportLegends = () => {
    return (
        <div className="feature-type-legends">
            <div className="feature-type-list">
                {Object.keys(reportImgStatus).map((key) => {
                    const statusKey = key as StatusKey;
                    return (
                        <div key={statusKey}>
                            <div className="feature-type-image">
                                <img src={reportImgStatus[statusKey].img} alt="" width={24} height={34} />
                            </div>
                            <span className="feature-type-description">{reportImgStatus[statusKey].text}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportLegends;
