import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { PostDetail } from './PostDetail';
const maxPostPage = 10;

async function fetchPosts(pageNum) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${pageNum}`
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  // calling useQueryClient
  const queryClient = useQueryClient();

  // Need useEffect because we don't know when the data will be available. I.e. data from th server is asynchronous
  useEffect(() => {
    if (currentPage < maxPostPage) {
      const nextPage = currentPage + 1;
      queryClient.fetchQuery(['posts'], nextPage, () => fetchPosts(nextPage));
    }
  }, [queryClient, currentPage]);

  // Destructure the data property from the returned useQuery object
  // The useQuery object returns with a lot of properties we can use
  // useQuery args: 1st arg: The QUERY KEY i.e. name of the query; 2nd arg: function to get the data e.g. using native fetch or axios
  // Remember fetching data from the server is asynchronous, so we have to handle the waiting period, otherwise WILL get an error
  const { data, isError, error, isLoading } = useQuery(
    ['posts', currentPage],
    () => fetchPosts(currentPage),
    { staleTime: 2000, keepPreviousData: true } // keepPreviousData: true keeps the last data in the cache  so it is there if we go back
  );

  if (isLoading) return <h3>Loading...</h3>;

  if (isError)
    return (
      <>
        <h3>Oops something went wrong</h3>
        <p>{error.toString()}</p>
      </>
    );

  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => {
            setCurrentPage((prevValue) => prevValue - 1);
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => {
            setCurrentPage((prevValue) => prevValue + 1);
          }}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
