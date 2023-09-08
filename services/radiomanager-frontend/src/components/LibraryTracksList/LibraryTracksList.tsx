import { UserTrack } from '@/api'
import { TracksList } from '@/components/common/TrackList'
import { InfiniteScroll } from '@/components/common/InfiniteScroll/InfiniteScroll'
import AnimatedBars from '@/icons/AnimatedBars'
import { MenuItemType, useContextMenu } from '@/modules/ContextMenu'
import { useRef } from 'react'

interface LibraryTrackEntry {
  trackId: number
  title: string
  artist: string
  album: string
  duration: number
}

export const toLibraryTrackEntry = (track: UserTrack): LibraryTrackEntry => ({
  trackId: track.tid,
  title: track.title || track.filename,
  artist: track.artist ?? '',
  album: track.album ?? '',
  duration: track.duration,
})

interface Props {
  readonly tracks: readonly LibraryTrackEntry[]
  readonly canInfinitelyScroll: boolean
  readonly onInfiniteScroll: () => void
  readonly onDeleteTracks: (trackIds: readonly number[]) => void
}

export const LibraryTracksList: React.FC<Props> = ({
  tracks,
  canInfinitelyScroll,
  onInfiniteScroll,
  onDeleteTracks,
}) => {
  const contextMenu = useContextMenu()
  const contextMenuRef = useRef(null)

  const handleTracksListMenu = (
    selectedTracks: readonly LibraryTrackEntry[],
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (selectedTracks.length === 0) {
      return
    }

    contextMenu.show({
      menuItems: [
        {
          onClick: () => {
            onDeleteTracks(selectedTracks.map(({ trackId }) => trackId))
          },
          type: MenuItemType.Item,
          label: 'Remove from your library',
        },
      ],
      portalElement: contextMenuRef?.current ?? undefined,
      position: {
        x: event.clientX,
        y: event.clientY,
      },
    })
  }

  return (
    <section className={'h-full'}>
      <TracksList
        totalTracks={canInfinitelyScroll ? tracks.length + 50 : tracks.length}
        topTrackOffset={0}
        tracks={tracks}
        currentTrack={null}
        onTracksListMenu={handleTracksListMenu}
        contextMenuRef={contextMenuRef}
        onScrollBottom={onInfiniteScroll}
        onScrollTop={() => console.log('top')}
      />
    </section>
  )
}
