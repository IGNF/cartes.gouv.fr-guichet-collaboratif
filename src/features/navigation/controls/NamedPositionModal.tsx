import ModaleComponent from "@/components/ModaleComponent";
import { getLocationAutocomplete, LocationAutocompleteResult } from "@/api/geocodageData";
import { DEFAULT_NAMED_POSITION_ZOOM } from "@/constants/localStorage/types";
import { isValidNamedPositionCoordinates } from "@/constants/localStorage/utils";
import { StatusMessage } from "@/constants/communities/types";
import useDebounce from "@/hooks/useDebounce";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useLocalStorageStore, useMapStore, useModalStore } from "@/store";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { transform } from "ol/proj";
import { useCallback, useEffect, useRef, useState } from "react";

type SavePositionSource = "selected_result" | "map_center" | "manual_coordinates";

type NamedPositionFieldErrorKey = "positionName" | "locationQuery" | "coordinates";

type NamedPositionFieldErrors = Record<NamedPositionFieldErrorKey, string | null>;

const EMPTY_FIELD_ERRORS: NamedPositionFieldErrors = {
    positionName: null,
    locationQuery: null,
    coordinates: null,
};

const NamedPositionModal: React.FC = () => {
    const { namedPositionModal } = useModalStore();
    const { community, addAlertMessage } = useCommunityStore();
    const { map, namedPositionCandidate, setNamedPositionCandidate } = useMapStore();
    const { t } = useTranslation({ ToolsControl: {} });

    const [positionName, setPositionName] = useState("");
    const [source, setSource] = useState<SavePositionSource>("map_center");
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [locationSuggestions, setLocationSuggestions] = useState<LocationAutocompleteResult[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationAutocompleteResult | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<NamedPositionFieldErrors>(EMPTY_FIELD_ERRORS);
    const keepValuesOnNextOpenRef = useRef(false);
    const locationRequestIdRef = useRef(0);

    const debouncedLocationQuery = useDebounce(locationQuery, 300);

    const getMapCenterCandidate = useCallback(() => {
        if (!map) {
            return null;
        }

        const center = map.getView().getCenter();
        if (!center) {
            return null;
        }

        const coordinates = transform(center, map.getView().getProjection(), "EPSG:4326") as [number, number];
        if (!isValidNamedPositionCoordinates(coordinates)) {
            return null;
        }

        return {
            name: t("default_name"),
            coordinates,
            zoom: map.getView().getZoom() || DEFAULT_NAMED_POSITION_ZOOM,
        };
    }, [map, t]);

    const resetFromContext = useCallback(() => {
        const mapCenter = getMapCenterCandidate();

        setPositionName(namedPositionCandidate?.name || "");
        setSource(namedPositionCandidate ? "selected_result" : "map_center");
        setLongitude(mapCenter ? mapCenter.coordinates[0].toFixed(6) : "");
        setLatitude(mapCenter ? mapCenter.coordinates[1].toFixed(6) : "");
        setLocationQuery(namedPositionCandidate?.name || "");
        setLocationSuggestions([]);
        setSelectedLocation(
            namedPositionCandidate
                ? {
                      fulltext: namedPositionCandidate.name,
                      x: namedPositionCandidate.coordinates[0],
                      y: namedPositionCandidate.coordinates[1],
                  }
                : null
        );
        setIsLoadingLocation(false);
        setFieldErrors(EMPTY_FIELD_ERRORS);
    }, [getMapCenterCandidate, namedPositionCandidate]);

    useEffect(() => {
        if (source !== "selected_result") {
            setLocationSuggestions([]);
            setIsLoadingLocation(false);
            return;
        }

        const query = debouncedLocationQuery.trim();
        if (query.length < 3) {
            setLocationSuggestions([]);
            setIsLoadingLocation(false);
            return;
        }

        if (selectedLocation && query === selectedLocation.fulltext.trim()) {
            setLocationSuggestions([]);
            setIsLoadingLocation(false);
            return;
        }

        let isCancelled = false;
        const requestId = ++locationRequestIdRef.current;
        setIsLoadingLocation(true);

        void getLocationAutocomplete(query)
            .then((results) => {
                if (isCancelled || requestId !== locationRequestIdRef.current) {
                    return;
                }

                setLocationSuggestions(results.slice(0, 5));
            })
            .finally(() => {
                if (isCancelled || requestId !== locationRequestIdRef.current) {
                    return;
                }

                setIsLoadingLocation(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [debouncedLocationQuery, selectedLocation, source]);

    useIsModalOpen(namedPositionModal, {
        onDisclose: () => {
            if (keepValuesOnNextOpenRef.current) {
                keepValuesOnNextOpenRef.current = false;
                return;
            }

            resetFromContext();
        },
        onConceal: () => {
            locationRequestIdRef.current += 1;
            keepValuesOnNextOpenRef.current = false;
        },
    });

    const showValidationError = useCallback(
        (field: NamedPositionFieldErrorKey, message: string) => {
            setFieldErrors({ ...EMPTY_FIELD_ERRORS, [field]: message });
            keepValuesOnNextOpenRef.current = true;
            namedPositionModal.open();
        },
        [namedPositionModal]
    );

    const clearFieldError = useCallback((field: NamedPositionFieldErrorKey) => {
        setFieldErrors((previousErrors) => {
            if (!previousErrors[field]) {
                return previousErrors;
            }

            return {
                ...previousErrors,
                [field]: null,
            };
        });
    }, []);

    const onChangeSource = useCallback((nextSource: SavePositionSource) => {
        setSource(nextSource);
        setFieldErrors(EMPTY_FIELD_ERRORS);
    }, []);

    const resolveCandidate = useCallback(() => {
        if (source === "selected_result") {
            if (selectedLocation) {
                return {
                    name: selectedLocation.fulltext,
                    coordinates: [selectedLocation.x, selectedLocation.y] as [number, number],
                    zoom: map?.getView().getZoom() || DEFAULT_NAMED_POSITION_ZOOM,
                };
            }

            if (locationQuery.trim().length > 0) {
                return null;
            }

            return namedPositionCandidate;
        }

        if (source === "map_center") {
            return getMapCenterCandidate();
        }

        const lon = Number(longitude.replace(",", "."));
        const lat = Number(latitude.replace(",", "."));
        const coordinates: [number, number] = [lon, lat];

        if (!isValidNamedPositionCoordinates(coordinates)) {
            return null;
        }

        return {
            name: t("default_name"),
            coordinates,
            zoom: map?.getView().getZoom() || DEFAULT_NAMED_POSITION_ZOOM,
        };
    }, [getMapCenterCandidate, namedPositionCandidate, latitude, locationQuery, longitude, map, selectedLocation, source, t]);

    const onConfirm = useCallback(() => {
        const candidate = resolveCandidate();
        if (!candidate) {
            if (source === "selected_result" && locationQuery.trim().length > 0) {
                showValidationError("locationQuery", t("error_select_location"));
                return;
            }

            showValidationError(
                source === "selected_result" ? "locationQuery" : "coordinates",
                source === "selected_result" ? t("error_selected_result_unavailable") : t("error_invalid_coordinates")
            );
            return;
        }

        if (!community?.name) {
            showValidationError("positionName", t("error_empty_name"));
            return;
        }
        const finalName = positionName.trim() || candidate.name.trim();

        const result = useLocalStorageStore.getState().addNamedPosition(community.name, {
            name: finalName,
            coordinates: candidate.coordinates,
            zoom: candidate.zoom,
        });

        if (!result.ok) {
            if (result.reason === "EMPTY_NAME") {
                showValidationError("positionName", t("error_empty_name"));
                return;
            }
            if (result.reason === "INVALID_COORDINATES") {
                showValidationError("coordinates", t("error_invalid_coordinates"));
                return;
            }
            if (result.reason === "DUPLICATE_NAME") {
                showValidationError("positionName", t("error_duplicate_name"));
                return;
            }

            showValidationError("coordinates", t("error_duplicate_coordinates"));
            return;
        }

        setFieldErrors(EMPTY_FIELD_ERRORS);

        setNamedPositionCandidate({
            name: result.value.name,
            coordinates: result.value.coordinates,
            zoom: result.value.zoom,
        });

        addAlertMessage(StatusMessage.success, t("save_success"));
        namedPositionModal.close();
    }, [
        addAlertMessage,
        community?.name,
        locationQuery,
        namedPositionModal,
        positionName,
        resolveCandidate,
        setNamedPositionCandidate,
        showValidationError,
        source,
        t,
    ]);

    const onChangeLocationQuery = useCallback(
        (value: string) => {
            setLocationQuery(value);
            clearFieldError("locationQuery");

            if (selectedLocation && value !== selectedLocation.fulltext) {
                setSelectedLocation(null);
            }
        },
        [clearFieldError, selectedLocation]
    );

    const onSelectLocationSuggestion = useCallback(
        (suggestion: LocationAutocompleteResult) => {
            setSelectedLocation(suggestion);
            setLocationQuery(suggestion.fulltext);
            setLocationSuggestions([]);
            setIsLoadingLocation(false);
            clearFieldError("locationQuery");

            if (!positionName.trim()) {
                setPositionName(suggestion.fulltext);
            }

            setNamedPositionCandidate({
                name: suggestion.fulltext,
                coordinates: [suggestion.x, suggestion.y],
                zoom: map?.getView().getZoom() || DEFAULT_NAMED_POSITION_ZOOM,
            });
        },
        [clearFieldError, map, positionName, setNamedPositionCandidate]
    );

    const onClose = useCallback(() => {
        namedPositionModal.close();
    }, [namedPositionModal]);

    return (
        <ModaleComponent
            modal={namedPositionModal}
            title={t("modal_title")}
            onConfirm={onConfirm}
            onClose={onClose}
            confirmText={t("save_button")}
            cancelText={t("cancel_button")}
        >
            <div className="NamedPositionModalForm">
                <p className="fr-hint-text">{t("modal_helper_text")}</p>

                <div className={`fr-input-group${fieldErrors.positionName ? " fr-input-group--error" : ""}`}>
                    <label className="fr-label" htmlFor="named-position-name-input">
                        {t("name_label")}
                    </label>
                    <input
                        id="named-position-name-input"
                        type="text"
                        className="fr-input"
                        autoComplete="off"
                        maxLength={120}
                        value={positionName}
                        onChange={(event) => {
                            setPositionName(event.target.value);
                            clearFieldError("positionName");
                        }}
                    />
                    {fieldErrors.positionName && <p className="fr-error-text">{fieldErrors.positionName}</p>}
                </div>

                <fieldset className="fr-fieldset NamedPositionSourceFieldset">
                    <legend className="fr-fieldset__legend">{t("source_label")}</legend>

                    <div className="NamedPositionSourceOptions">
                        <div className="fr-radio-group">
                            <input
                                id="named-position-source-center"
                                type="radio"
                                name="named-position-source"
                                value="map_center"
                                checked={source === "map_center"}
                                onChange={() => onChangeSource("map_center")}
                            />
                            <label className="fr-label" htmlFor="named-position-source-center">
                                {t("source_map_center")}
                            </label>
                        </div>

                        <div className="fr-radio-group">
                            <input
                                id="named-position-source-selected"
                                type="radio"
                                name="named-position-source"
                                value="selected_result"
                                checked={source === "selected_result"}
                                onChange={() => onChangeSource("selected_result")}
                            />
                            <label className="fr-label" htmlFor="named-position-source-selected">
                                {t("source_selected_result")}
                            </label>
                        </div>

                        <div className="fr-radio-group">
                            <input
                                id="named-position-source-manual"
                                type="radio"
                                name="named-position-source"
                                value="manual_coordinates"
                                checked={source === "manual_coordinates"}
                                onChange={() => onChangeSource("manual_coordinates")}
                            />
                            <label className="fr-label" htmlFor="named-position-source-manual">
                                {t("source_manual_coordinates")}
                            </label>
                        </div>
                    </div>
                </fieldset>

                <div className="NamedPositionSourceContent">
                    {source === "selected_result" && !namedPositionCandidate && (
                        <p className="NamedPositionSelectedResultHint">{t("error_selected_result_unavailable")}</p>
                    )}

                    {source === "selected_result" && (
                        <>
                            <div className={`fr-input-group${fieldErrors.locationQuery ? " fr-input-group--error" : ""}`}>
                                <input
                                    id="named-position-location-input"
                                    type="text"
                                    className="fr-input"
                                    autoComplete="off"
                                    value={locationQuery}
                                    onChange={(event) => onChangeLocationQuery(event.target.value)}
                                    placeholder={t("location_search_placeholder")}
                                />
                                {fieldErrors.locationQuery && <p className="fr-error-text">{fieldErrors.locationQuery}</p>}
                            </div>

                            {isLoadingLocation && <p className="NamedPositionAutocompleteLoading">{t("location_suggestions_loading")}</p>}

                            {locationSuggestions.length > 0 && (
                                <ul className="NamedPositionAutocompleteList" role="listbox">
                                    {locationSuggestions.map((suggestion) => {
                                        const key = `${suggestion.fulltext}-${suggestion.x}-${suggestion.y}`;
                                        return (
                                            <li key={key} className="NamedPositionAutocompleteItem" role="option">
                                                <button type="button" onClick={() => onSelectLocationSuggestion(suggestion)}>
                                                    {suggestion.fulltext}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </>
                    )}

                    <div className={`NamedPositionManualCoordinates ${source === "manual_coordinates" ? "" : "gpf-hidden"}`}>
                        <div className={`fr-input-group${fieldErrors.coordinates ? " fr-input-group--error" : ""}`}>
                            <label className="fr-label" htmlFor="named-position-lat-input">
                                {t("latitude_label")}
                            </label>
                            <input
                                id="named-position-lat-input"
                                type="text"
                                className="fr-input"
                                inputMode="decimal"
                                autoComplete="off"
                                value={latitude}
                                onChange={(event) => {
                                    setLatitude(event.target.value);
                                    clearFieldError("coordinates");
                                }}
                            />
                        </div>

                        <div className={`fr-input-group${fieldErrors.coordinates ? " fr-input-group--error" : ""}`}>
                            <label className="fr-label" htmlFor="named-position-lon-input">
                                {t("longitude_label")}
                            </label>
                            <input
                                id="named-position-lon-input"
                                type="text"
                                className="fr-input"
                                inputMode="decimal"
                                autoComplete="off"
                                value={longitude}
                                onChange={(event) => {
                                    setLongitude(event.target.value);
                                    clearFieldError("coordinates");
                                }}
                            />
                            {fieldErrors.coordinates && <p className="fr-error-text">{fieldErrors.coordinates}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </ModaleComponent>
    );
};

export default NamedPositionModal;
