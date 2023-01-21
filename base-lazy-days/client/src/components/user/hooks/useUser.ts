import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

// We need to get the signal to the user function so we can pass it to the axios call
// How we get the signal: we destructure it from the arguments that useQuery passes to the query function
async function getUser(
  user: User | null,
  signal: AbortSignal,
): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      signal, // AbortSignal from React Query
      headers: getJWTHeader(user),
    },
  );
  return data.user;
}

// The hook is going to maintain local state, both in local storage and in the queryCache
interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  const queryClient = useQueryClient();

  // TODO: call useQuery to update user data from server
  // The user argument in getUser is whatever the user value is at that point in time
  // The value will be falsy UNTIL we update it with updateUser function below
  // The onSuccess option takes 1 arg: function
  // The onSuccess option gets the data from EITHER the query function (useQuery 2nd arg), OR from the setQueryData function
  // This is because onSuccess runs for EITHER useQuery function and setQueryData

  // const { data: user } = useQuery([queryKeys.user], () => getUser(user), {
  //   initialData: getStoredUser,
  //   onSuccess: (received: User | null) => {
  //     if (!received) {
  //       clearStoredUser();
  //     } else {
  //       setStoredUser(received);
  //     }
  //   },
  // });

  // We need to get the signal to the user function so we can pass it to the axios call
  // How we get the signal:
  // - we destructure it from the object of arguments that useQuery passes to the query function
  // We pass it as a second argument to getUser
  const { data: user } = useQuery({
    queryKey: [queryKeys.user],
    queryFn: ({ signal }) => getUser(user, signal),
    initialData: getStoredUser,
    onSuccess: (received: null | User) => {
      if (!received) {
        clearStoredUser();
      } else {
        setStoredUser(received);
      }
    },
  });

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // TODO: update the user in the query cache
    // setQueryData takes 2 args: arg 1: key; arg 2: value
    // It sets the value for that key in the query cache, similar how a normal query function would do it (except without the function)
    queryClient.setQueryData([queryKeys.user], newUser);

    setStoredUser(newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // TODO: reset user to null in query cache
    // Setting the setQueryData to null to clear the user from the cache
    queryClient.setQueryData([queryKeys.user], null);
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]); // Now when the user signs out, that query data will NO LONGER be available
  }

  return { user, updateUser, clearUser };
}
