import cn from 'classnames'
import { Channel } from '@/api'
import Link from 'next/link'

type ActiveItem =
  | readonly ['channel', number]
  | readonly ['library']
  | readonly ['unused']
  | readonly ['upload']

interface Props {
  channels: readonly Channel[]
  activeItem: ActiveItem | null
}

export const Sidebar: React.FC<Props> = ({ channels, activeItem }) => {
  const activeChannelId = activeItem?.[0] === 'channel' ? activeItem[1] : null

  return (
    <div className={'py-0'}>
      <h3 className={'text-gray-500 p-4 text-sm font-medium'}>LIBRARY</h3>
      <ul className={'pb-2'}>
        <li
          className={cn('px-4 py-2', 'text-ellipsis overflow-hidden', {
            'bg-morblue-400 text-gray-50': activeItem?.[0] === 'library',
          })}
        >
          <Link className={'block'} href={`/`}>
            All Tracks
          </Link>
        </li>
        <li
          className={cn('px-4 py-2', 'text-ellipsis overflow-hidden', {
            'bg-morblue-400 text-gray-50': activeItem?.[0] === 'unused',
          })}
        >
          <Link className={'block'} href={`/unused`}>
            Unused Tracks
          </Link>
        </li>
      </ul>
      <h3 className={'text-gray-500 p-4 text-sm font-medium'}>CHANNELS</h3>
      <ul>
        {channels.map((channel) => {
          return (
            <li
              key={channel.sid}
              className={cn('px-4 py-2', 'text-ellipsis overflow-hidden', {
                'bg-morblue-400 text-gray-50': activeChannelId === channel.sid,
              })}
            >
              <Link className={'block truncate'} href={`/c/${channel.sid}`}>
                {channel.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
