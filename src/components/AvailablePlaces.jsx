import { useState, useEffect } from "react";

import Error from "./Error.jsx";
import Places from "./Places.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const availablePlaces = await fetchAvailablePlaces();
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            availablePlaces,
            position.coords.latitude,
            position.coords.longitude
          );
          setAvailablePlaces(sortedPlaces);
          setIsLoading(false);
        });
      } catch (error) {
        setError({ message: error.message || "Could not fetch places." });
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  if (error) {
    return <Error title="An error occurred!" message={error.message} />;
  }

  return (
    <>
      <Places
        title="Available Places"
        places={availablePlaces}
        isLoading={isLoading}
        loadingText="Fetching places data..."
        fallbackText="No places available."
        onSelectPlace={onSelectPlace}
      />
    </>
  );
}
