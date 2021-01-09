import { hot } from "react-hot-loader";
import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import useSWR, { useSWRInfinite } from "swr";
import ClipLoader from "react-spinners/ClipLoader";
import "bulma/css/bulma.min.css";
axios.defaults.baseURL = "https://jsonplaceholder.typicode.com";

const LoadingPage = () => (
  <div
    style={{
      // position: "fixed",
      // top: 0,
      // bottom: 0,
      // left: 0,
      // right: 0,
      // zIndex: 999,
      width: "100%",
      height: "20rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    }}
  >
    <ClipLoader />
  </div>
);

const ErrorPage = ({ error }) => {
  return (
    <div style={{ widh: "30rem", height: "20rem" }}>
      <article className="message is-danger">
        <div className="message-body">
          <pre>{JSON.stringify(error, null, 4)}</pre>
        </div>
      </article>
    </div>
  );
};

const EmptyPage = () => {
  return (
    <article className="message">
      <div className="message-header">
        <p>沒有資料</p>
        <button className="delete" aria-label="delete"></button>
      </div>
      <div className="message-body">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.{" "}
        <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta
        nec nulla. Vestibulum rhoncus ac ex sit amet fringilla. Nullam gravida
        purus diam, et dictum <a>felis venenatis</a> efficitur. Aenean ac{" "}
        <em>eleifend lacus</em>, in mollis lectus. Donec sodales, arcu et
        sollicitudin porttitor, tortor urna tempor ligula, id porttitor mi magna
        a neque. Donec dui urna, vehicula et sem eget, facilisis sodales sem.
      </div>
    </article>
  );
};

const FetchData = ({ isLoading, isError, isEmpty, data, error }) => {
  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage error={error} />;
  if (isEmpty) return <EmptyPage />;
  return (
    <pre style={{ overflowY: "auto", height: "20rem" }}>
      {JSON.stringify(data, null, 4)}
    </pre>
  );
};
const NormalPage = () => {
  const [page, setPage] = useState(1);
  const [postId, setPostId] = useState(1);
  const [dataCount, setDataCount] = useState();
  const rows = 3;
  const fetcher = (url) =>
    axios.get(url).then((res) => {
      const dataTotal = res.headers["x-total-count"] || 1;
      setDataCount(Math.floor(dataTotal / 3));
      return res.data;
    });
  const { data, error } = useSWR(
    `/comments?_page=${page}&_limit=${rows}&postId=${postId}`,
    fetcher
  );
  const isLoading = !error && !data;
  const isError = error;
  const isEmpty = data && data.length === 0;

  return (
    <div className="App">
      <h1>正常頁面</h1>
      <FetchData {...{ isEmpty, isError, isLoading, data }} />
      <div className="select">
        <select onChange={(e) => setPostId(e.currentTarget.value)}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>
      <nav className="pagination" role="navigation" aria-label="pagination">
        <a className="pagination-previous">Previous</a>
        <a className="pagination-next">Next page</a>
        <ul className="pagination-list">
          {Array.from(Array(5), (_, i) => {
            return (
              <li>
                <a
                  className="pagination-link"
                  aria-label="Goto page 1"
                  onClick={() => setPage(i + 1)}
                >
                  {i}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

const InfinitePage = () => {
  const rows = 10;
  const getKey = (pageIndex, prePageData) => {
    return `/comments?_page=${pageIndex + 1}&_limit=${rows}`;
  };
  const fetcher = (url) => axios.get(url).then((res) => res.data);
  const { data, error, isValidating, mutate, size, setSize } = useSWRInfinite(
    getKey,
    fetcher
  );
  const isLoading = !error && !data;
  const isError = error;
  const isEmpty = data && data.length === 0;
  return (
    <div>
      <FetchData
        {...{
          isLoading,
          isError,
          isEmpty,
          data: data ? [].concat(...data) : [],
          error,
        }}
      />
      <button onClick={() => setSize(size + 1)}>Load More</button>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <NormalPage />
      <h1>Inifinte</h1>
      <InfinitePage />
    </div>
  );
};

export default hot(module)(App);
