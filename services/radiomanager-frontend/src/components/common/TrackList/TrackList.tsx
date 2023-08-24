import { useRef } from 'react'
import { TrackItem, CurrentTrack } from './types'
import { TrackListItem } from '@/components/common/TrackList/TrackListItem'
import { useListItemSelector } from '@/hooks/useListItemSelector'
import { useClickOutside } from '@/hooks/useClickOutside'

interface Props {
  readonly tracks: readonly TrackItem[]
  readonly currentTrack: CurrentTrack | null
  readonly onThreeDotsClick: (trackIndex: number) => void
}

export const TrackList: React.FC<Props> = ({ tracks, currentTrack, onThreeDotsClick }) => {
  const listRef = useRef(null)
  const selector = useListItemSelector(tracks)

  useClickOutside(listRef, () => selector.reset())

  return (
    <ul ref={listRef}>
      <li className="flex text-gray-500">
        <div className="pl-4 pr-2 py-4 w-12 flex-shrink-0 text-right">#</div>
        <div className="px-2 py-4 w-full">Title</div>
        <div className="px-2 py-4 w-full hidden xl:block">Album</div>
        <div className="px-2 py-4 w-20 flex-shrink-0 text-right">⏱</div>
        <div className="pl-2 pr-4 py-4 w-10 flex-shrink-0 text-right" />
      </li>

      {selector.listItems.map((listItem, index) => {
        return (
          <TrackListItem
            key={index}
            track={listItem.item}
            currentTrack={currentTrack}
            index={index}
            onRemoveFromLibrary={() => {}}
            onRemoveFromChannel={() => {}}
            isSelected={listItem.isSelected}
            onSelect={() => selector.selectOnly(index)}
            onThreeDotsClick={() => onThreeDotsClick(index)}
          />
        )
      })}
    </ul>
  )
}
