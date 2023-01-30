import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { mockUser } from '../../../mocks/mockData';
import { renderWithQueryClient } from '../../../test-utils';
import { Calendar } from '../Calendar';

// mocking useUser to mimic a logged-in user i.e. we are simulating a logged in user
// This is available for tests in this file
jest.mock('../../user/hooks/useUser', () => ({
  __esModule: true,
  useUser: () => ({ user: mockUser }),
}));

test('Reserve appointment', async () => {
  // Using the custom React Query client wrapped with a provider, so we have access to all React Query Hooks
  renderWithQueryClient(
    <MemoryRouter>
      <Calendar />
    </MemoryRouter>,
  );

  // find all the appointments
  const appointments = await screen.findAllByRole('button', {
    // Regex that has the time of day, and then the appointment
    name: /\d\d? [ap]m\s+(scrub|facial|massage)/i,
  });

  // click on the first one to reserve
  // Waiting for an event to be fired
  fireEvent.click(appointments[0]);

  // check for the toast alert
  const alertToast = await screen.findByRole('alert');
  expect(alertToast).toHaveTextContent('reserve');

  // close alert to keep state clean and wait for it to disappear, to avoid errors from Jest
  const alertCloseButton = screen.getByRole('button', { name: 'Close' });
  alertCloseButton.click();
  // Waiting for toasts to be removed at the end
  await waitForElementToBeRemoved(alertToast);
});

test('Cancel appointment', async () => {
  // Using the custom React Query client wrapped with a provider, so we have access to all React Query Hooks
  renderWithQueryClient(
    <MemoryRouter>
      <Calendar />
    </MemoryRouter>,
  );

  const cancelButtons = await screen.findAllByRole('button', {
    name: /cancel appointment/i,
  });

  // click on the first one to reserve
  // Waiting for an event to be fired
  fireEvent.click(cancelButtons[0]);

  // check for the toast alert
  const alertToast = await screen.findByRole('alert');
  expect(alertToast).toHaveTextContent('The appointment has been removed!');

  // close alert to keep state clean and wait for it to disappear, to avoid errors from Jest
  const alertCloseButton = screen.getByRole('button', { name: 'Close' });
  alertCloseButton.click();
  // Waiting for toasts to be removed at the end
  await waitForElementToBeRemoved(alertToast);
});
