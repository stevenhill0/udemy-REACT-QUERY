import { useMutation, useQueryClient } from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): (newData: User | null) => void {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient(); // need the Query CLient because are dealing directly with the cached. Running it to get the query client instance

  // NOTE: Whatever data is passed to our mutate function, is going to be passed to our onMutate function
  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      // 1) Going to take a snapshot, cos onMutate returns a context that is passed to the onError handler
      // All inside is what we have to take care of when the mutate function fires off
      onMutate: async (newData: User | null) => {
        // Cancel any outgoing queries for user data, so old server data does not override optimistic update
        queryClient.cancelQueries([queryKeys.user]);

        // Snapshot of previous user value
        const previousUserData: User = queryClient.getQueryData([
          queryKeys.user,
        ]);

        // Optimistically update the cache with the new value
        // Using the updateUser function from useUser custom hook: it sets our query client cache
        updateUser(newData); // data passed from the onMutate function: which was passed from the mutate function

        // Return context object with snapshot value
        // Returning an object that has the previousUserData property: and the value of whatever was in the cache before we updated it
        return { previousUserData };
      },
      // 2) onError is going to take that context
      // onError takes 3 args: 1st: error; 2nd: newData; 3rd: context (Previous user data Context of the returned object from the onMutate handler)
      // The error and newData args are not going to be used
      onError: (error, newData, context) => {
        // if there is an error, roll back the cache to the last saved value
        // If the if statement  is truthy, then we want to roll back
        // previousUserData is the returned property in the context
        if (context.previousUserData) {
          updateUser(context.previousUserData);
          toast({
            title: 'Update failed! Restoring previous update.',
            status: 'warning',
          });
        }
      },
      // 3)
      onSuccess: (userData: User | null) => {
        if (userData) {
          toast({ title: 'User updated!', status: 'success' });
        }
      },
      // 4) onSettled means when you have resolved your mutation (error or success), you are going to run this onSettled callback
      onSettled: () => {
        // Invalidate the data for the user
        // Invalidate user query to make sure we are in sync with serer data
        // General good practice to show the user the most up-to-date data from the server

        // When the query is invalidated it will trigger a refresh
        queryClient.invalidateQueries([queryKeys.user]);
      },
    },
  );

  return patchUser;
}
