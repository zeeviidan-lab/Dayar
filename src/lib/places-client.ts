/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Address autocomplete via the NEW Places API (AutocompleteSuggestion).
// The legacy google.maps.places.Autocomplete widget returns no results for
// Google Cloud projects created after March 2025, so we fetch suggestions
// ourselves and render our own dropdown.

let placesLibPromise: Promise<any> | null = null;
function placesLib(): Promise<any> {
  if (placesLibPromise === null) {
    placesLibPromise = (window as any).google.maps.importLibrary("places") as Promise<any>;
  }
  return placesLibPromise;
}

export interface AddressSuggestion {
  id: string;
  label: string;
  raw: any;
}

export async function fetchAddressSuggestions(input: string): Promise<AddressSuggestion[]> {
  if (!input.trim() || !(window as any).google?.maps) return [];
  try {
    const lib = await placesLib();
    const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      includedRegionCodes: ["il"],
      language: "he",
    });
    return (suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .slice(0, 5)
      .map((s: any, i: number) => ({
        id: s.placePrediction.placeId ?? String(i),
        label: s.placePrediction.text?.text ?? "",
        raw: s.placePrediction,
      }));
  } catch {
    return [];
  }
}

export interface ResolvedAddress {
  addr: string;
  city: string;
  lat: number | null;
  lng: number | null;
  hasStreetNum: boolean;
  display: string;
}

export async function resolveSuggestion(s: AddressSuggestion): Promise<ResolvedAddress | null> {
  try {
    const place = s.raw.toPlace();
    await place.fetchFields({ fields: ["addressComponents", "formattedAddress", "location"] });
    const comps: any[] = place.addressComponents ?? [];
    const get = (type: string) => comps.find((c) => c.types?.includes(type));
    const city = get("locality")?.longText ?? get("administrative_area_level_2")?.longText ?? "";
    const streetNum = get("street_number")?.longText ?? "";
    const streetName = get("route")?.longText ?? "";
    const addr = streetNum ? `${streetName} ${streetNum}` : streetName || (place.formattedAddress ?? s.label);
    return {
      addr,
      city,
      lat: place.location?.lat?.() ?? null,
      lng: place.location?.lng?.() ?? null,
      hasStreetNum: !!streetNum,
      display: city ? `${addr}, ${city}` : addr,
    };
  } catch {
    return null;
  }
}
