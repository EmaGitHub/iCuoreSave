import { LatLng } from "@ionic-native/google-maps";

export interface Directions {
    bounds: LatLng[];
    points: any;
    distance: string;
    duration: string;

}