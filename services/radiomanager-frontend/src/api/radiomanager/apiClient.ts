import z from 'zod'
import { config } from '@/config'
import { isomorphicFetch } from '../isomorphicFetch'
import { ChannelEntrySchema, UserTrackSchema } from './apiTypes'

export const BACKEND_BASE_URL = config.NEXT_PUBLIC_RADIOMANAGER_BACKEND_URL

export const MAX_TRACKS_PER_REQUEST = 200

interface PageRequestOptions {
  readonly offset?: number
  readonly limit?: number
  readonly signal?: AbortSignal
}

const GetUserTracksPageSchema = z.object({
  items: z.array(UserTrackSchema),
  totalCount: z.number().nonnegative(),
  paginationData: z.object({
    offset: z.number().nonnegative(),
    limit: z.number().nonnegative(),
  }),
})

export const getUserTracksPage = async (opts: PageRequestOptions = {}) => {
  const url = new URL(`${BACKEND_BASE_URL}/radio-manager/api/v1/tracks/all`)

  url.searchParams.set('offset', String(opts?.offset ?? 0))
  url.searchParams.set('limit', String(opts?.limit ?? MAX_TRACKS_PER_REQUEST))

  const res = await isomorphicFetch(url, { signal: opts?.signal })
  const json = await res.json()

  return GetUserTracksPageSchema.parse(json)
}

const GetUnusedUserTracksPageSchema = GetUserTracksPageSchema

export const getUnusedUserTracksPage = async (opts: PageRequestOptions = {}) => {
  const url = new URL(`${BACKEND_BASE_URL}/radio-manager/api/v1/tracks/unused`)

  url.searchParams.set('offset', String(opts?.offset ?? 0))
  url.searchParams.set('limit', String(opts?.limit ?? MAX_TRACKS_PER_REQUEST))

  const res = await isomorphicFetch(url, { signal: opts?.signal })
  const json = await res.json()

  return GetUnusedUserTracksPageSchema.parse(json)
}

const ChannelTracksEntrySchema = z.object({
  track: UserTrackSchema,
  entry: ChannelEntrySchema,
})
export type ChannelTrackEntry = z.TypeOf<typeof ChannelTracksEntrySchema>

const GetChannelTracksPageResponseSchema = z.object({
  items: z.array(ChannelTracksEntrySchema),
  totalCount: z.number().nonnegative(),
  paginationData: z.object({
    offset: z.number().nonnegative(),
    limit: z.number().nonnegative(),
  }),
})

export const getChannelTracksPage = async (channelId: number, opts: PageRequestOptions = {}) => {
  const url = new URL(`${BACKEND_BASE_URL}/radio-manager/api/v1/tracks/channel/${channelId}`)

  url.searchParams.set('offset', String(opts?.offset ?? 0))
  url.searchParams.set('limit', String(opts?.limit ?? MAX_TRACKS_PER_REQUEST))

  const res = await isomorphicFetch(url, { signal: opts?.signal })
  const json = await res.json()

  return GetChannelTracksPageResponseSchema.parse(json)
}

export const playNext = async (channelId: number): Promise<void> => {
  await fetch(`${BACKEND_BASE_URL}/radio-manager/api/v0/streams/${channelId}/controls/play-next`, {
    method: 'post',
    credentials: 'include',
  })
}

export const playPrev = async (channelId: number): Promise<void> => {
  await fetch(`${BACKEND_BASE_URL}/radio-manager/api/v0/streams/${channelId}/controls/play-prev`, {
    method: 'post',
    credentials: 'include',
  })
}

export const play = async (channelId: number): Promise<void> => {
  await fetch(`${BACKEND_BASE_URL}/radio-manager/api/v0/streams/${channelId}/controls/play`, {
    method: 'post',
    credentials: 'include',
  })
}

export const pause = async (channelId: number): Promise<void> => {
  await fetch(`${BACKEND_BASE_URL}/radio-manager/api/v0/streams/${channelId}/controls/pause`, {
    method: 'post',
    credentials: 'include',
  })
}

export const stop = async (channelId: number): Promise<void> => {
  await fetch(`${BACKEND_BASE_URL}/radio-manager/api/v0/streams/${channelId}/controls/stop`, {
    method: 'post',
    credentials: 'include',
  })
}

export const seek = async (channelId: number, position: number): Promise<void> => {
  await fetch(
    `${BACKEND_BASE_URL}/radio-manager/api/v0/streams/${channelId}/controls/seek/${position}`,
    {
      method: 'post',
      credentials: 'include',
    },
  )
}

export const playFrom = async (channelId: number, playlistPosition: number): Promise<void> => {
  await fetch(
    `${BACKEND_BASE_URL}/radio-manager/api/v0/streams/${channelId}/controls/play-from/${playlistPosition}`,
    {
      method: 'post',
      credentials: 'include',
    },
  )
}
