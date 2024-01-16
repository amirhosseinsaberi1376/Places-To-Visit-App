import { useRef, useState, useCallback } from "react";
import { useFetch } from "./hooks/useFetch.js";
import React from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import Error from "./components/Error.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";

function App() {
  const selectedPlace = useRef();

  const [errorUpdationPlaces, setErrorUpdatingPlaces] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { fetchedData, setFetchedData, isLoading, error } = useFetch(
    fetchUserPlaces,
    []
  );

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setFetchedData((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });
    try {
      await updateUserPlaces([selectedPlace, ...fetchedData]);
    } catch (error) {
      setFetchedData(fetchedData);
      setErrorUpdatingPlaces({
        message: error.message || "Failed to update places.",
      });
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setFetchedData((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        )
      );
      try {
        await updateUserPlaces(
          fetchedData.filter((place) => place.id !== selectedPlace.current.id)
        );
      } catch (error) {
        setFetchedData(fetchedData);
        setErrorUpdatingPlaces({
          message: error.message || "Failed to delete place.",
        });
      }

      setModalIsOpen(false);
    },
    [fetchedData]
  );

  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal open={errorUpdationPlaces} onClose={handleError}>
        {errorUpdationPlaces && (
          <Error
            title="An error occurred!"
            message={errorUpdationPlaces.message}
            onConfirm={handleError}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occurred" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            isLoading={isLoading}
            loadingText="Fetching your places..."
            places={fetchedData}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
