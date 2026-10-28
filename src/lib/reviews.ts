import "server-only";

/**
 * Reseñas reales de Google del local (Places API New, "Text Search").
 * Necesita GOOGLE_PLACES_API_KEY. Sin clave, devuelve null y la web muestra solo el enlace a Google.
 * Se guarda en caché 12 horas para no gastar cuota de la API.
 */

export type GoogleReview = {
  author: string;
  photo?: string;
  authorUrl?: string;
  rating: number;
  text: string;
  when: string; // "hace 2 meses"
};

export type GoogleReviews = {
  rating: number;
  total: number;
  mapsUrl: string;
  reviews: GoogleReview[];
};

type PlacesResponse = {
  places?: {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: {
      rating?: number;
      relativePublishTimeDescription?: string;
      text?: { text?: string };
      originalText?: { text?: string };
      authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
    }[];
  }[];
};

export async function getGoogleReviews(query: string): Promise<GoogleReviews | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.rating,places.userRatingCount,places.googleMapsUri,places.reviews",
      },
      body: JSON.stringify({ textQuery: process.env.GOOGLE_PLACE_QUERY || query, languageCode: "es", maxResultCount: 1 }),
      next: { revalidate: 60 * 60 * 12 },
    });
    if (!res.ok) return null;
    const place = ((await res.json()) as PlacesResponse).places?.[0];
    if (!place?.rating) return null;
    return {
      rating: place.rating,
      total: place.userRatingCount ?? 0,
      mapsUrl: place.googleMapsUri ?? "",
      reviews: (place.reviews ?? [])
        .map((r) => ({
          author: r.authorAttribution?.displayName ?? "Cliente de Google",
          photo: r.authorAttribution?.photoUri,
          authorUrl: r.authorAttribution?.uri,
          rating: r.rating ?? 5,
          text: (r.originalText?.text || r.text?.text || "").trim(),
          when: r.relativePublishTimeDescription ?? "",
        }))
        .filter((r) => r.text),
    };
  } catch {
    return null;
  }
}
