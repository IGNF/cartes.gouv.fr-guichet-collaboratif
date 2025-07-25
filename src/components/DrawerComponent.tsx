import Button from "@codegouvfr/react-dsfr/Button";
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

const DrawerComponent: React.FC<Props> = ({ anchor, isOpen, children, create, onClose }) => {
    const mapToolbarHeader = document.getElementById("map-toolbar-header");
    const headerHeight = mapToolbarHeader?.clientHeight || 0;
    return (
        <MuiDsfrThemeProvider>
            <Drawer
                anchor={anchor}
                open={isOpen}
                onClose={onClose}
                className="drawer-component"
                variant="persistent"
                sx={{ "& .MuiDrawer-paper,.MuiBackdrop-root": { height: `calc(100vh - ${headerHeight}px)`, top: headerHeight, overflow: "unset" } }}
            >
                <div className="drawer-close">
                    {!create && <Button iconId="ri-close-line" onClick={onClose} priority="tertiary no outline" title="Fermer" />}
                </div>
                <div className="drawer-content" style={{ height: `calc(100vh - 40px - ${headerHeight}px)`, overflow: "auto" }}>
                    {children}
                </div>
            </Drawer>
        </MuiDsfrThemeProvider>
    );
};

export default DrawerComponent;
