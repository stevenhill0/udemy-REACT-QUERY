import InfiniteScroll from 'react-infinite-scroller';
import { useInfiniteQuery } from '@tanstack/react-query';

import { Person } from './Person';

const initialUrl = 'https://swapi.dev/api/people/';

const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  // data contains the pages data
  // fetchNextPage tells Infinite Scroll what function to run when we want more data
  // hasNextPage is a Boolean which determines whether there is any more data to collect

  // useInfiniteQuery takes x args:
  // 1st arg: Query Key
  // 2nd arg: Query function, similar to useQuery: function takes an object parameter that has pageParam as one of the properties
  // pageParam (URL) is what EVERYTHING pivots on
  //3rd arg: Option object:
  // option 1: getNextPageParam: takes a function, which takes lastPage as an argument; if you want can have a second arg i.e. allPages
  // lastPage arg is the data from the last time we ran the query function
  // The next property from the previous data, contains the next url we need. NOTE: this is from the SWAPI and may NOT be the same with a different API

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery(
    ['sw-people'],
    ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    { getNextPageParam: (lastPage) => lastPage.next || undefined } // setting to undefined if lastPage.next is falsy, cos the SWAPI default is null
  );

  if (isLoading) return <div className="loading">Loading...</div>;

  if (isError)
    return (
      <>
        <div className="loading">Oops there is an error</div>
        <p>{error.toString()}</p>
      </>
    );

  // Within the infinite scroll component we are going to display the data
  // Mapping over the pages property returned from the useInfiniteQuery and mapping over it
  // Then mapping over the results, which contains the people object
  return (
    <>
      {isFetching && <div className="loading">Loading...</div>}
      <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
        {data.pages.map((pageData) => {
          return pageData.results.map((person) => {
            return (
              <Person
                key={person.name}
                name={person.name}
                hairColor={person.hair_color}
                eyeColor={person.eye_color}
              />
            );
          });
        })}
      </InfiniteScroll>
    </>
  );
}
