import { JSX } from "react";
import Drawer from "@mui/material/Drawer";
import { APP_FOOTER_MIN_HEIGHT } from "@/constants";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";

type AnchorType = "left" | "top" | "right" | "bottom" | undefined;

interface Props {
    anchor: AnchorType;
    isOpen: boolean;
    children: JSX.Element;
    create?: boolean;
    onClose: () => void;
    isListingReports?: boolean;
}

const DrawerComponent: React.FC<Props> = ({ anchor, isOpen, children, onClose, isListingReports = false }) => {
    const mapToolbarHeader = document.getElementById("map-toolbar-header");
    const headerHeight = (mapToolbarHeader?.clientHeight || 0) + APP_FOOTER_MIN_HEIGHT;

    return (
        <MuiDsfrThemeProvider>
            <Drawer
                anchor={anchor}
                open={isOpen}
                onClose={onClose}
                className="drawer-component"
                variant="persistent"
                sx={{
                    "& .MuiDrawer-paper,.MuiBackdrop-root": {
                        width: isListingReports ? undefined : "calc(37vw)",
                        height: `calc(100vh - ${headerHeight}px)`,
                        top: mapToolbarHeader?.clientHeight || 0,
                        overflow: "unset",
                    },
                }}
            >
                <div className="drawer-content" style={{ height: `100%`, overflow: "auto" }}>
                    {children}
                </div>
            </Drawer>
        </MuiDsfrThemeProvider>
    );
};

export default DrawerComponent;
