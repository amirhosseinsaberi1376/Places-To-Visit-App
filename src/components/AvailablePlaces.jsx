/* eslint-disable react/prop-types */

import { useFetch } from "../hooks/useFetch.js";
import React from "react";

import Error from "./Error.jsx";
import Places from "./Places.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";

async function fetchSortedPlaces() {
  const places = await fetchAvailablePlaces();
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        places,
        position.coords.latitude,
        position.coords.longitude
      );
      resolve(sortedPlaces);
    });
  });
}

export default function AvailablePlaces({ onSelectPlace }) {
  const { error, isLoading, fetchedData } = useFetch(fetchSortedPlaces, []);

  if (error) {
    return <Error title="An error occurred!" message={error.message} />;
  }

  return (
    <>
      <Places
        title="Available Places"
        places={fetchedData}
        isLoading={isLoading}
        loadingText="Fetching places data..."
        fallbackText="No places available."
        onSelectPlace={onSelectPlace}
      />
    </>
  );
}
