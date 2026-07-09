import { StatusKey } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";

const ReportLegends = () => {
    return (
        <div className="layer-switcher-legends">
            {Object.keys(reportImgStatus).map((key) => {
                const statusKey = key as StatusKey;
                return (
                    <div key={statusKey}>
                        <img src={reportImgStatus[statusKey].img} alt={reportImgStatus[statusKey].text} width={24} height={34} />
                        <span>{reportImgStatus[statusKey].text}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ReportLegends;
