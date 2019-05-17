import { Audio, AudioListener } from 'three'

const listener = new AudioListener()
const audio = new Audio(listener)

export { audio, listener }
