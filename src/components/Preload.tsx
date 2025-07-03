import { otherMarkers, reportImgStatus } from "@/constants/utils";
import createPointImg from "../img/reports/create_point.png";

const preloadImgList = [createPointImg, ...otherMarkers.map((marker) => marker.src), ...Object.values(reportImgStatus).map((status) => status.img)];

const Preload = () => {
    return (
        <>
            {preloadImgList.map((imgSrc) => (
                <img src={imgSrc} property="low" style={{ display: "none" }} />
            ))}
        </>
    );
};

export default Preload;
