// @ts-nocheck

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined,
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

// TODO: update type for React Query mutate function
type AppointmentMutationFunction = (appointment: Appointment) => void;

export function useReserveAppointment(): AppointmentMutationFunction {
  const { user } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  // Mutate function
  const { mutate } = useMutation(
    (appointment) => setAppointmentUser(appointment, user?.id),
    {
      onSuccess: () => {
        // Note 1.1: At the moment we are ONLY invalidating the appointments query. We want to invalidate the appointments and user
        // Note 1.1: We need to use query key prefixes to target multiple queries
        queryClient.invalidateQueries([queryKeys.appointments]);

        toast({
          title: 'You have reserved the appointment!',
          status: 'success',
        });
      },
    },
  );

  return mutate;
}
