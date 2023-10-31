interface Props {
  size: number
}

export const MuteIcon: React.FC<Props> = ({ size }) => {
  return (
    <svg width={size} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <path
        fill={'currentColor'}
        d="M542.86 294.4L362.3 430a10.72 10.72 0 0 0-2.71 3.25H255.53v153.2h104.06a10.58 10.58 0 0 0 2.71 3.25l180.56 135.52a10.83 10.83 0 0 0 17.34-8.66v-413.5a10.83 10.83 0 0 0-17.34-8.66zM742.6 599.41L765 577l-67.2-67.2 67.2-67.2-22.4-22.4-67.2 67.2-67.2-67.2-22.4 22.4 67.2 67.2-67.2 67.2 22.4 22.4 67.2-67.2 67.2 67.2z"
      />
    </svg>
  )
}
