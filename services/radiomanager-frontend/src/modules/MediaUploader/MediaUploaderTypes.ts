import { UserChannelTrack, UserTrack } from '@/api/api.types'

export enum UploadedTrackType {
  LIBRARY = 'LIBRARY',
  CHANNEL = 'CHANNEL',
}

interface UploadedLibraryTrack {
  readonly type: UploadedTrackType.LIBRARY
  readonly track: UserTrack
}

interface UploadedChannelTrack {
  readonly type: UploadedTrackType.CHANNEL
  readonly channelId: number
  readonly track: UserChannelTrack
}

export type UploadedTrack = UploadedLibraryTrack | UploadedChannelTrack

export enum UploadingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
}

export interface UploadingState {
  readonly status: UploadingStatus
}

export interface QueueItem {
  readonly channelId?: number
  readonly file: File
}

export interface UploadErrorItem {
  readonly error: unknown
  readonly queueItem: QueueItem
}
