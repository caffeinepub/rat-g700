import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Build, BuildData, Item, Metadata, UserProfile } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Metadata Queries
export function useGetMetadata() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Metadata | null>({
    queryKey: ['metadata'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMetadata();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSetMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metadata: Metadata) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setMetadata(metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metadata'] });
    },
  });
}

// Build Queries
export function useGetBuilds() {
  const { actor, isFetching } = useActor();

  return useQuery<Build[]>({
    queryKey: ['builds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBuilds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBuild(buildId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Build | null>({
    queryKey: ['build', buildId?.toString()],
    queryFn: async () => {
      if (!actor || buildId === null) return null;
      return actor.getBuild(buildId);
    },
    enabled: !!actor && !isFetching && buildId !== null,
  });
}

export function useCreateBuild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuildData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBuild(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}

export function useUpdateBuild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ buildId, data, clearItems = false }: { buildId: bigint; data: BuildData; clearItems?: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBuild(buildId, data, clearItems);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
      queryClient.invalidateQueries({ queryKey: ['build', variables.buildId.toString()] });
    },
  });
}

export function useDeleteBuild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buildId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBuild(buildId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}

// Item Queries
export function useAddItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ buildId, item }: { buildId: bigint; item: Item }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addItem(buildId, item);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['build', variables.buildId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ buildId, itemId, item }: { buildId: bigint; itemId: bigint; item: Item }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateItem(buildId, itemId, item);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['build', variables.buildId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}

export function useRemoveItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ buildId, itemId }: { buildId: bigint; itemId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeItem(buildId, itemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['build', variables.buildId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}
