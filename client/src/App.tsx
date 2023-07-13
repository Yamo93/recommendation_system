import React, { ChangeEvent, useEffect, useState } from 'react';
import Button from './Button';
import ButtonGroup from './ButtonGroup';
import { similarities, SIMILARITY_IDS } from './const';
import FilterPanel from './FilterPanel';
import Input from './Input';
import Table from './Table';

interface User {
  id: number;
  name: string;
}

interface Movie {
  movieId: number;
  title: string;
  score: number;
  year: number;
}

export interface Record {
  name: string;
  id: number;
  score: number;
}

interface MatchingPayload {
  similarity: string;
  results: number;
  userId: number;
}

function App() {
  const [results, setResults] = useState(3);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User>({ id: -1, name: '' });
  const [records, setRecords] = useState<Record[]>([]);
  const [similarity, setSimilarity] = useState(
    similarities[SIMILARITY_IDS.EUCLIDEAN]
  );

  function updateResults(event: ChangeEvent<HTMLInputElement>): void {
    const newResults = Number(event.target.value);
    setResults(newResults);
  }

  async function findTopMatchingUsers(): Promise<void> {
    const payload: MatchingPayload = {
      similarity: similarity.key,
      userId: user.id,
      results,
    };
    try {
      const response = await fetch(
        'http://localhost:3000/api/users/top-matching-users',
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const r: Record[] = await response.json();
      setRecords(r);
    } catch (error) {
      console.error('Could not get top matching users', error);
    }
  }

  async function findRecommendedMovies(): Promise<void> {
    const payload: MatchingPayload = {
      similarity: similarity.key,
      userId: user.id,
      results,
    };
    try {
      const response = await fetch(
        'http://localhost:3000/api/movies/recommended-movies',
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const movies: Movie[] = await response.json();
      const r: Record[] = movies.map((m) => ({
        id: m.movieId,
        name: m.title,
        score: m.score,
      }));
      setRecords(r);
    } catch (error) {
      console.error('Could not find recommended movies', error);
    }
  }

  async function findItemBasedRecommendations(): Promise<void> {
    const payload: MatchingPayload = {
      similarity: similarity.key,
      userId: user.id,
      results,
    };
    try {
      const response = await fetch(
        'http://localhost:3000/api/movies/item-based-recommended-movies',
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const movies: Movie[] = await response.json();
      const r: Record[] = movies.map((m) => ({
        id: m.movieId,
        name: m.title,
        score: m.score,
      }));
      setRecords(r);
    } catch (error) {
      console.error('Could not find item-based recommended movies', error);
    }
  }

  async function fetchUsers(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/api/users/all');
      const u: User[] = await response.json();
      setUsers(u);
      // set user to first one if exists
      if (u.length) {
        setUser(u[0]);
      }
    } catch (error) {
      console.error('Could not fetch users', error);
    }
  }

  function handleSimilarity(e: ChangeEvent<HTMLSelectElement>): void {
    const value = Number(e.target.value);
    const newSimilarity = similarities[value];
    if (newSimilarity) setSimilarity(newSimilarity);
  }

  function handleUser(e: ChangeEvent<HTMLSelectElement>): void {
    const value = Number(e.target.value);
    const newUser = users.find((u: User) => u.id === value);
    if (newUser) setUser(newUser);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <FilterPanel>
        <div>
          <label>User</label>
          <select value={user.id} onChange={handleUser}>
            {users.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Similarity</label>
          <select value={similarity.id} onChange={handleSimilarity}>
            {Object.values(similarities).map((similarity: any) => (
              <option key={similarity.id} value={similarity.id}>
                {similarity.text}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Results"
          type="number"
          value={results}
          setValue={updateResults}
        />
      </FilterPanel>

      <ButtonGroup>
        <Button text="Find top matching users" onClick={findTopMatchingUsers} />
        <Button
          text="Find recommended movies"
          onClick={findRecommendedMovies}
        />
        <Button
          text="Find recommendations, item-based"
          onClick={findItemBasedRecommendations}
        />
      </ButtonGroup>

      <Table records={records} />
    </div>
  );
}

export default App;
