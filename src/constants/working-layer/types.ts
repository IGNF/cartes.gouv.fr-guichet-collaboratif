import { Feature } from "ol";
import { Geometry } from "ol/geom";

export enum AutomaticFieldType {
    USER_ID = "userId",
    USERNAME = "username",

    CURRENT_DATE = "currentDate",
    CURRENT_DATETIME = "currentDateTime",

    LONGITUDE = "longitude",
    LATITUDE = "latitude",
    X = "x",
    Y = "y",

    LENGTH = "length",
    AREA = "area",
    AREA_KM2 = "area_km2",
    AREA_HA = "area_ha",

    MUNICIPALITY_NAME = "municipalityName",
    MUNICIPALITY_INSEE = "municipalityInsee",
    MUNICIPALITY_POSTCODE = "municipalityPostcode",
    DEPARTMENT = "department",

    FULL_ADDRESS = "fullAddress",
    HOUSENUMBER = "housenumber",
    STREET = "street",
    ADDRESS = "address",

    PARCEL_NUMBER = "parcelNumber",
    PARCEL_SHEET = "parcelSheet",
    PARCEL_SECTION = "parcelSection",

    ALTITUDE = "altitude",
}

export interface AutomaticFieldContext {
    feature: Feature<Geometry>;
    userId?: string;
    username?: string;
    layerProjection: string;
}
