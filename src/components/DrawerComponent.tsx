import { APP_FOOTER_MIN_HEIGHT } from "@/constants";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Drawer from "@mui/material/Drawer";
import { JSX } from "react";

type AnchorType = "left" | "top" | "right" | "bottom" | undefined;

interface Props {
    anchor: AnchorType;
    isOpen: boolean;
    children: JSX.Element;
    create?: boolean;
    onClose: () => void;
}

const DrawerComponent: React.FC<Props> = ({ anchor, isOpen, children, onClose }) => {
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
                        height: `calc(100vh - ${headerHeight}px)`,
                        top: mapToolbarHeader?.clientHeight || 0,
                        overflow: "unset",
                    },
                }}
            >
                <div className="drawer-content" style={{ height: `calc(100vh - 40px - ${headerHeight}px)`, overflow: "auto" }}>
                    {children}
                </div>
            </Drawer>
        </MuiDsfrThemeProvider>
    );
};

export default DrawerComponent;
