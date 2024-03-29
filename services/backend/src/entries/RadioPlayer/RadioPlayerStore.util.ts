import makeDebug from 'debug'
import { makeIcyDemuxedStream, streamAsyncIterator } from './IcyDemuxer.utils'

const debug = makeDebug('RadioPlayerStore:util')

export function playAudio(htmlAudioElement: HTMLAudioElement, src: string) {
  debug('Starting audio playback: %s', src)
  htmlAudioElement.src = src
  htmlAudioElement.load()
  htmlAudioElement.play().catch((error) => {
    debug('Unable to start audio playback: %s', error)
  })
}

export function playMediaSource(htmlAudioElement: HTMLAudioElement, source: MediaSource) {
  debug('Starting audio playback: %s', source)
  htmlAudioElement.src = URL.createObjectURL(source)
  htmlAudioElement.load()
  htmlAudioElement.play().catch((error) => {
    debug('Unable to start audio playback: %s', error)
  })
}

export function stopAudio(htmlAudioElement: HTMLAudioElement) {
  debug('Stopping audio playback')
  htmlAudioElement.pause()
  htmlAudioElement.load()
  htmlAudioElement.removeAttribute('src')
}

export async function appendBufferAsync(
  sourceBuffer: SourceBuffer,
  buffer: Uint8Array,
): Promise<void> {
  sourceBuffer.appendBuffer(buffer)

  if (sourceBuffer.updating) {
    await new Promise((resolve) => {
      sourceBuffer.onupdateend = () => resolve(null)
    })
  }
}
