import { useQuery } from '@tanstack/react-query';

import type { Appointment, User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from './useUser';

// for when we need a query function for useQuery
async function getUserAppointments(
  user: User | null,
): Promise<Appointment[] | null> {
  if (!user) return null; // Including null: in case there is NO user so we don't contact the server
  const { data } = await axiosInstance.get(`/user/${user.id}/appointments`, {
    headers: getJWTHeader(user),
  });
  return data.appointments;
}

export function useUserAppointments(): Appointment[] {
  const { user } = useUser();
  const fallback: Appointment[] = [];

  const { data: userAppointments = fallback } = useQuery(
    [queryKeys.appointments, queryKeys.user, user?.id],
    () => getUserAppointments(user),
    // Using the enabled option. This will make sure that ONLY if the user is TRUTHY will it enable the query
    { enabled: !!user }, // Note: We are using a double bang operator to convert the user to a Boolean
  );

  return userAppointments;
}
