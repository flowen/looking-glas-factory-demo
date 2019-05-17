// import player from './audioplayer';
import { audio } from '../objects/Audio'
import createAnalyser from 'web-audio-analyser'

/* create audio analyser */
var audioUtil = createAnalyser(audio.gain, audio.context, {
  stereo: false,
})

var analyser = audioUtil.analyser

// from: http://www.teachmeaudio.com/mixing/techniques/audio-spectrum
var bands = {
  sub: {
    from: 20,
    to: 250,
  },

  low: {
    from: 251,
    to: 500,
  },

  mid: {
    from: 501,
    to: 3000,
  },

  high: {
    from: 3001,
    to: 6000,
  },
}

export { audioUtil, analyser, bands }
