import { otherMarkers, reportImgStatus } from "@/constants/utils";
import createPointImg from "../img/reports/create_point.png";

const preloadImgList = [createPointImg, ...otherMarkers.map((marker) => marker.src), ...Object.values(reportImgStatus).map((status) => status.img)];

const Preload = () => {
    return (
        <>
            {preloadImgList.map((imgSrc, index) => (
                <link key={`preload-img-${index}`} href={imgSrc} rel="preload" as="image" />
            ))}
        </>
    );
};

export default Preload;
