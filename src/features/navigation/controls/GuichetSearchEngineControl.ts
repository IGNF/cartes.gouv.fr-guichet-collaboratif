import SearchEngineAdvanced from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngineAdvanced.js";
import OlFeature from "ol/Feature";
import Point from "ol/geom/Point";
import type Map from "ol/Map";
import type Geometry from "ol/geom/Geometry";
import { getCenter } from "ol/extent";
import { transform } from "ol/proj";
import { NAMED_POSITION_UPDATED_EVENT, NamedPosition, NamedPositionCandidate, DEFAULT_NAMED_POSITION_ZOOM } from "@/constants/localStorage/types";
import { isValidNamedPositionCoordinates } from "@/constants/localStorage/utils";
import { useCommunityStore, useLocalStorageStore, useModalStore } from "@/store";
import { useMapStore } from "@/store/useMapStore";

interface SearchEngineBaseLike {
    _updateList: (tab?: unknown[], type?: string) => void;
    acContainer: HTMLDivElement;
    autocompleteFooter: HTMLDivElement;
    input: HTMLInputElement;
}

interface ObservableLike {
    on: (type: string, listener: (event: unknown) => void) => void;
    un: (type: string, listener: (event: unknown) => void) => void;
}

interface SearchSelectionEvent {
    item?: unknown;
    title?: string;
}

interface SearchResultEvent {
    result?: OlFeature<Geometry>;
}

export interface NamedPositionTexts {
    openModalButton: string;
    favoritesTitle: string;
    emptyFavorites: string;
    removeFavorite: string;
    modalTitle: string;
    positionNameLabel: string;
    sourceLabel: string;
    sourceSelectedResult: string;
    sourceMapCenter: string;
    sourceManualCoordinates: string;
    longitudeLabel: string;
    latitudeLabel: string;
    saveButton: string;
    cancelButton: string;
    defaultPositionName: string;
    selectedResultUnavailable: string;
    errorEmptyName: string;
    errorInvalidCoordinates: string;
    errorDuplicateName: string;
    errorDuplicateCoordinates: string;
}

export type NamedPositionSearchEngineOptions = ConstructorParameters<typeof SearchEngineAdvanced>[0] & {
    namedPositionTexts: NamedPositionTexts;
};

export default class NamedPositionSearchEngineControl extends SearchEngineAdvanced {
    private readonly namedPositionTexts: NamedPositionTexts;
    private isNamedPositionUiReady = false;
    private restoreUpdateList: (() => void) | null = null;
    private cleanups: Array<() => void> = [];
    private favoritesSection: HTMLDivElement | null = null;
    private favoritesList: HTMLUListElement | null = null;
    private lastSaveCandidate: NamedPositionCandidate | null = null;

    constructor(options: NamedPositionSearchEngineOptions) {
        const { namedPositionTexts, ...searchOptions } = options;
        super(searchOptions);
        this.namedPositionTexts = namedPositionTexts;
    }

    override setMap(map: Map | null): void {
        if (this.isNamedPositionUiReady) {
            this.teardownNamedPositionUi();
        }

        super.setMap(map);

        if (map) {
            this.setupNamedPositionUi();
        }
    }

    private setupNamedPositionUi() {
        if (this.isNamedPositionUiReady) {
            return;
        }

        this.attachAdvancedButton();
        this.attachFavoritesSection();
        this.patchSearchHistoryRendering();

        const observable = this.getObservable();
        const onSearch = this.handleSearchResult as (event: unknown) => void;
        const onSelect = this.handleSearchSelection as (event: unknown) => void;

        observable.on("search", onSearch);
        observable.on("select", onSelect);

        this.cleanups.push(() => {
            observable.un("search", onSearch);
            observable.un("select", onSelect);
        });

        const onNamedPositionUpdate = () => {
            this.renderFavoritesSection("history");
        };

        window.addEventListener(NAMED_POSITION_UPDATED_EVENT, onNamedPositionUpdate as EventListener);

        this.cleanups.push(() => {
            window.removeEventListener(NAMED_POSITION_UPDATED_EVENT, onNamedPositionUpdate as EventListener);
        });

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") {
                return;
            }

            this.closeSearchPanels();
        };

        document.addEventListener("keydown", onKeyDown);

        this.cleanups.push(() => {
            document.removeEventListener("keydown", onKeyDown);
        });

        this.renderFavoritesSection("history");
        this.isNamedPositionUiReady = true;
    }

    private closeSearchPanels() {
        if (this.advancedBtn?.getAttribute("aria-expanded") === "true") {
            this.listenToClick = false;
            this.advancedBtn.setAttribute("aria-expanded", "false");
            this.closeAllSections();
        }

        const baseSearchEngine = this.getBaseSearchEngine();
        if (!baseSearchEngine) {
            return;
        }

        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement && this.element.contains(activeElement)) {
            activeElement.blur();
        }

        if (baseSearchEngine.input === document.activeElement) {
            baseSearchEngine.input.blur();
        }
    }

    private teardownNamedPositionUi() {
        this.cleanups.forEach((cleanup) => cleanup());
        this.cleanups = [];

        if (this.restoreUpdateList) {
            this.restoreUpdateList();
            this.restoreUpdateList = null;
        }

        this.favoritesSection?.remove();
        this.favoritesSection = null;
        this.favoritesList = null;

        this.lastSaveCandidate = null;
        useMapStore.getState().setNamedPositionCandidate(null);

        this.isNamedPositionUiReady = false;
    }

    private getBaseSearchEngine() {
        return this.baseSearchEngine as unknown as SearchEngineBaseLike | undefined;
    }

    private getObservable() {
        return this as unknown as ObservableLike;
    }

    private patchSearchHistoryRendering() {
        const baseSearchEngine = this.getBaseSearchEngine();
        if (!baseSearchEngine || this.restoreUpdateList) {
            return;
        }

        const originalUpdateList = baseSearchEngine._updateList.bind(baseSearchEngine);

        baseSearchEngine._updateList = (tab?: unknown[], type: string = "search") => {
            originalUpdateList(tab, type);
            this.renderFavoritesSection(type);
        };

        this.restoreUpdateList = () => {
            baseSearchEngine._updateList = originalUpdateList;
        };
    }

    private attachAdvancedButton() {
        if (!this.advancedContainer) {
            return;
        }

        const existingButton = this.advancedContainer.querySelector(".GPNamedPositionOpenButton") as HTMLButtonElement | null;
        if (existingButton) {
            return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "GPNamedPositionOpenButton fr-btn fr-btn--sm fr-icon-star-line fr-btn--icon-left fr-btn--tertiary-no-outline";
        button.title = this.namedPositionTexts.openModalButton;
        button.textContent = this.namedPositionTexts.openModalButton;

        const firstSection = this.advancedContainer.querySelector("section");
        if (firstSection) {
            this.advancedContainer.insertBefore(button, firstSection);
        } else {
            this.advancedContainer.appendChild(button);
        }

        button.addEventListener("click", this.openModal);

        this.cleanups.push(() => {
            button.removeEventListener("click", this.openModal);
            button.remove();
        });
    }

    private attachFavoritesSection() {
        const baseSearchEngine = this.getBaseSearchEngine();
        if (!baseSearchEngine || this.favoritesSection) {
            return;
        }

        const section = document.createElement("div");
        section.className = "GPNamedPositionSection gpf-hidden";

        const title = document.createElement("p");
        title.className = "GPlabelTitle GPNamedPositionTitle";
        title.textContent = this.namedPositionTexts.favoritesTitle;

        const list = document.createElement("ul");
        list.className = "GPNamedPositionList";

        section.appendChild(title);
        section.appendChild(list);

        baseSearchEngine.acContainer.insertBefore(section, baseSearchEngine.autocompleteFooter);

        this.favoritesSection = section;
        this.favoritesList = list;
    }

    private openModal = () => {
        useMapStore.getState().setNamedPositionCandidate(this.lastSaveCandidate);
        useModalStore.getState().namedPositionModal.open();
    };

    private handleSearchSelection = (event: SearchSelectionEvent) => {
        const position = this.getPositionFromSuggestion(event.item);
        if (!position) {
            return;
        }

        const name = typeof event.title === "string" && event.title.trim().length > 0 ? event.title.trim() : this.namedPositionTexts.defaultPositionName;
        const zoom = this.getMap()?.getView().getZoom() ?? DEFAULT_NAMED_POSITION_ZOOM;

        this.lastSaveCandidate = { name, coordinates: position, zoom };
        useMapStore.getState().setNamedPositionCandidate(this.lastSaveCandidate);
    };

    private handleSearchResult = (event: SearchResultEvent) => {
        if (!event.result) {
            return;
        }

        const position = this.getPositionFromFeature(event.result);
        if (!position) {
            return;
        }

        const rawFeatureTitle = event.result.get("infoPopup");
        const title = typeof rawFeatureTitle === "string" && rawFeatureTitle.trim().length > 0 ? rawFeatureTitle.trim() : "";
        const inputTitle = this.getBaseSearchEngine()?.input?.value?.trim() || "";
        const name = title || inputTitle || this.namedPositionTexts.defaultPositionName;
        const zoom = this.getMap()?.getView().getZoom() ?? DEFAULT_NAMED_POSITION_ZOOM;

        this.lastSaveCandidate = { name, coordinates: position, zoom };
        useMapStore.getState().setNamedPositionCandidate(this.lastSaveCandidate);
    };

    private getPositionFromSuggestion(item: unknown): [number, number] | null {
        if (!item || typeof item !== "object") {
            return null;
        }

        const itemRecord = item as Record<string, unknown>;
        const position = itemRecord.position;
        if (!position || typeof position !== "object") {
            return null;
        }

        const positionRecord = position as Record<string, unknown>;
        const longitude = typeof positionRecord.lon === "number" ? positionRecord.lon : positionRecord.x;
        const latitude = typeof positionRecord.lat === "number" ? positionRecord.lat : positionRecord.y;

        const coordinates: [number, number] = [Number(longitude), Number(latitude)];
        if (!isValidNamedPositionCoordinates(coordinates)) {
            return null;
        }

        return coordinates;
    }

    private getPositionFromFeature(feature: OlFeature<Geometry>): [number, number] | null {
        const geometry = feature.getGeometry();
        if (!geometry) {
            return null;
        }

        const mapCoordinate = geometry.getType() === "Point" ? (geometry as Point).getCoordinates() : getCenter(geometry.getExtent());
        const map = this.getMap();

        const sourceProjection = map?.getView().getProjection() || "EPSG:3857";
        const lonLatCoordinate = transform(mapCoordinate, sourceProjection, "EPSG:4326") as [number, number];

        if (!isValidNamedPositionCoordinates(lonLatCoordinate)) {
            return null;
        }

        return lonLatCoordinate;
    }

    private renderFavoritesSection(type?: string) {
        const favoritesSection = this.favoritesSection;
        const favoritesList = this.favoritesList;

        if (!favoritesSection || !favoritesList) {
            return;
        }

        const currentType = type || this.getBaseSearchEngine()?.acContainer?.dataset.type;
        const namedPositions = useLocalStorageStore.getState().localStorageData?.namedPositions ?? [];
        const shouldDisplayFavorites = currentType === "history" && namedPositions.length > 0;

        favoritesSection.classList.toggle("gpf-hidden", !shouldDisplayFavorites);
        if (!shouldDisplayFavorites) {
            return;
        }

        favoritesList.innerHTML = "";

        namedPositions.forEach((namedPosition) => {
            favoritesList.appendChild(this.createFavoriteItem(namedPosition));
        });
    }

    private createFavoriteItem(namedPosition: NamedPosition) {
        const item = document.createElement("li");
        item.className = "GPNamedPositionItem";

        const selectButton = document.createElement("button");
        selectButton.type = "button";
        selectButton.className = "GPNamedPositionSelect gpf-panel__item gpf-panel__item-searchengine fr-icon-star-line fr-icon--sm";
        selectButton.textContent = namedPosition.name;
        selectButton.title = namedPosition.name;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "GPNamedPositionDelete fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-bin-line";
        deleteButton.title = this.namedPositionTexts.removeFavorite;
        deleteButton.setAttribute("aria-label", `${this.namedPositionTexts.removeFavorite}: ${namedPosition.name}`);

        selectButton.addEventListener("click", () => {
            this.focusNamedPosition(namedPosition);
        });

        deleteButton.addEventListener("click", () => {
            const communityName = useCommunityStore.getState().community?.name;
            if (communityName) {
                useLocalStorageStore.getState().deleteNamedPosition(communityName, namedPosition.id);
            }
            this.renderFavoritesSection("history");
        });

        item.appendChild(selectButton);
        item.appendChild(deleteButton);

        return item;
    }

    private focusNamedPosition(namedPosition: NamedPosition) {
        const map = this.getMap();
        if (!map) {
            return;
        }

        const mapCoordinates = transform(namedPosition.coordinates, "EPSG:4326", map.getView().getProjection()) as [number, number];
        const point = new Point(mapCoordinates);
        const searchEvent = this.createEvent(point, namedPosition.name);
        this.addResultToMap(searchEvent);

        const view = map.getView();
        view.setCenter(mapCoordinates);
        if (Number.isFinite(namedPosition.zoom)) {
            view.setZoom(namedPosition.zoom);
        }

        this.lastSaveCandidate = {
            name: namedPosition.name,
            coordinates: namedPosition.coordinates,
            zoom: namedPosition.zoom,
        };

        useMapStore.getState().setNamedPositionCandidate(this.lastSaveCandidate);
    }
}
