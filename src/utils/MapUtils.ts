
export interface MapDistance {
    km: number;
    m: number;
}

export interface LatLng {
    lat: number,
    lng: number
}

export class MapUtils {

    static calculateDistance(currentLocation: {latitude: number, longitude: number}, destination: {latitude: number, longitude: number}): MapDistance{
        var R = 6371; // Radius of the earth in km
        var dLat = MapUtils.deg2rad(destination.latitude - currentLocation.latitude);  // deg2rad below
        var dLon = MapUtils.deg2rad(destination.longitude - currentLocation.longitude);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(MapUtils.deg2rad(currentLocation.latitude)) * Math.cos(MapUtils.deg2rad(currentLocation.longitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        var distance = Math.round(d * 1000); // Distance in m
        return {
            km: d,
            m: distance
        };
    }

    static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    static decodePolyline(encoded: string): LatLng[] {
        // source: http://doublespringlabs.blogspot.com.br/2012/11/decoding-polylines-from-google-maps.html

        // array that holds the points
        var points=[ ]
        var index = 0, len = encoded.length;
        var lat = 0, lng = 0;
        while (index < len) {
            var b, shift = 0, result = 0;

            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
                result |= (b & 0x1f) << shift;
                shift += 5;
            }
            while (b >= 0x20);

            var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;
            shift = 0;
            result = 0;

            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            }
            while (b >= 0x20);

            var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;
            points.push({lat:( lat / 1E5), lng:( lng / 1E5)})
        }
        return points
    }
}