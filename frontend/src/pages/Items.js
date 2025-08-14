import React, { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useData } from '../state/DataContext';
import { useNavigate } from 'react-router-dom';
import '../style/Item.css';

function Items() {
  const { items, fetchItems } = useData();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch items
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchItems(page, 10, debouncedSearch)
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, fetchItems]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRowClick = (id) => {
    navigate(`/items/${id}`);
  };

  return (
    <div className="container">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={handleSearchChange}
        className="search-input"
      />

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <List
          height={400}
          itemCount={items.length}
          itemSize={50}
          width={'100%'}
        >
          {({ index, style }) => {
            const item = items[index];
            return (
              <div
                key={item.id}
                className="list-item"
                style={{ ...style, boxSizing: 'border-box' }}
                onClick={() => handleRowClick(item.id)}
              >
                {item.name}
              </div>
            );
          }}
        </List>
      )}

      <div className="pagination">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={items.length < 10}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;