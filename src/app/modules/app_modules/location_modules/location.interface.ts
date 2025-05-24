export interface ILocation {
    location: string;
    postalCode?: string;
    country?: string;
    coordinates?: {lat: number; lng: number}; // [longitude, latitude]
}