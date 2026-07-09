import ReactDOMServer from "react-dom/server";
import ReportLegends from "@/features/navigation/layers/legends/ReportLegends";

export const ReportLegendsHTML = ReactDOMServer.renderToString(<ReportLegends />);
