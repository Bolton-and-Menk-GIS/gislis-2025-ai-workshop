const amenities = ['animal_boarding', 'animal_breeding', 'animal_shelter', 'arts_centre', 'atm', 'baby_hatch', 'bank', 'bar', 'bbq', 'bench', 'bicycle_parking', 'bicycle_rental', 'bicycle_repair_station', 'biergarten', 'boat_rental', 'brothel', 'bureau_de_change', 'cafe', 'car_rental', 'car_sharing', 'car_wash', 'casino', 'charging_station', 'cinema', 'clinic', 'college', 'community_centre', 'conference_centre', 'courthouse', 'crematorium', 'dentist', 'doctors', 'dog_toilet', 'drinking_water', 'driving_school', 'events_venue', 'fast_food', 'fire_station', 'food_court', 'fountain', 'fuel', 'funeral_hall', 'gambling', 'give_box', 'grave_yard', 'hospital', 'ice_cream', 'internet_cafe', 'kindergarten', 'language_school', 'library', 'lounger', 'marketplace', 'music_school', 'nightclub', 'nursing_home', 'parking', 'pharmacy', 'place_of_worship', 'planetarium', 'police', 'post_box', 'post_depot', 'post_office', 'prison', 'pub', 'public_bath', 'public_bookcase', 'public_shower', 'ranger_station', 'restaurant', 'school', 'shelter', 'social_centre', 'social_facility', 'stripclub', 'studio', 'table', 'taxi', 'theatre', 'toilets', 'townhall', 'toy_library', 'university', 'veterinary', 'waste_basket', 'waste_disposal', 'waste_transfer_station', 'watering_place'] as const
type Amenity = typeof amenities[number]

export interface OsmPoi {
  id: string;
  type: "node" | "way" | "relation";
  name?: string;
  amenity?: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

/**
 * Fetch amenities from OSM Overpass within a radius of lat/lon.
 */
export async function fetchOsmAmenities(
  lat: number,
  lon: number,
  radius: number = 2000 // meters
): Promise<OsmPoi[]> {
  const query = `
[out:json][timeout:25];
(
  node["amenity"](around:${radius},${lat},${lon});
  way["amenity"](around:${radius},${lat},${lon});
  relation["amenity"](around:${radius},${lat},${lon});
);
out center;
  `;

  const url = "https://overpass-api.de/api/interpreter";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: query }).toString(),
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const pois: OsmPoi[] = data.elements.map((el: any) => {
    let lat = el.lat;
    let lon = el.lon;

    // Ways/relations return "center" object instead
    if (!lat && el.center) {
      lat = el.center.lat;
      lon = el.center.lon;
    }

    return {
      id: `${el.type}/${el.id}`,
      type: el.type,
      name: el.tags?.name,
      amenity: el.tags?.amenity,
      lat,
      lon,
      tags: el.tags || {},
    };
  });

  return pois;
}

// Example usage
(async () => {
  const results = await fetchOsmAmenities(44.9778, -93.2650, 1000);
  console.log(`Fetched ${results.length} amenities near downtown Minneapolis`);
  console.log(results.slice(0, 5));
})();
