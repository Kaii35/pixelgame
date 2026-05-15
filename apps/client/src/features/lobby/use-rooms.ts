import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { listRooms } from '../../api/rooms.api';

import type { RoomSummary } from '@pixelgame/shared-types';

export const useRoomsQuery = (): UseQueryResult<RoomSummary[], Error> =>
  useQuery<RoomSummary[], Error>({
    queryKey: ['rooms'],
    queryFn: listRooms,
    refetchInterval: 5_000,
  });
