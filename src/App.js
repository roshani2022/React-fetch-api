import React, { useState, useEffect, useCallback } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";
import AddMovie from "./components/AddMovie";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryTimeout, setRetryTimeout] = useState(null);

  useEffect(() => {
    return () => {
      clearTimeout(retryTimeout);
    };
  }, [retryTimeout]);

  const fetchMovieHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://react-api-project-85a0c-default-rtdb.firebaseio.com/movies.json"
      );

      if (!response.ok) {
        throw new Error("Something went wrong ....Retrying");
      }

      const data = await response.json();

      const loadedMovies = [];

      for (const key in data) {
        loadedMovies.push({
          id: key,
          title: data[key].title,
          openingText: data[key].openingText,
          releaseDate: data[key].releaseDate,
        });
      }

      setMovies(loadedMovies);
    } catch (error) {
      setError(error.message);
      const timeout = setTimeout(fetchMovieHandler, 5000);
      setRetryTimeout(timeout);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMovieHandler();
  }, [fetchMovieHandler]);

  const cancelRetringHadlker = () => {
    clearTimeout(retryTimeout);
    setError(null);
  };

  async function addMovieHandler(movie) {
    const response = await fetch(
      "https://react-api-project-85a0c-default-rtdb.firebaseio.com/movies.json",
      {
        method: "POST",
        body: JSON.stringify(movie),
        headers: {
          "content-type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log(data);
  }

  async function deleteMovieHandler(movieId) {

     await fetch(
      `https://react-api-project-85a0c-default-rtdb.firebaseio.com/movies/${movieId}.json`,
      {
        method: "DELETE",
      }
    );
    setMovies((preMovie) => preMovie.filter((movie) => movie.id !== movieId));
    
  }

 
  

  let content = <p> Found no movies</p>;

  if (movies.length > 0) {
    content = <MoviesList movies={movies} deleteMovie={deleteMovieHandler} />;
  }

  if (error) {
    content = (
      <>
        <p>{error}</p>{" "}
        <button onClick={cancelRetringHadlker}>Cancel Retrying</button>
      </>
    );
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMovieHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
