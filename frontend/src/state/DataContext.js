import React, { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext({
  items: [],
  fetchItems: async () => {},
});

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async (page = 1, limit = 20, search = '') => {
    try {
      const res = await fetch(
        `http://localhost:4001/api/items?q=${search}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);