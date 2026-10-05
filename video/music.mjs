// Synthesises a quiet ambient pad (four slow chords, crossfaded) and muxes it onto a video. No external audio.
// Usage: node video/music.mjs in.mp4 out.mp4
import { execFileSync } from 'node:child_process'

const CHORDS = [
  [110, 164.81, 196, 246.94, 261.63], // Am9
  [87.31, 130.81, 164.81, 220, 261.63], // Fmaj7
  [130.81, 196, 246.94, 329.63], // Cmaj7
  [98, 146.83, 246.94, 293.66], // G
]
const SEG = 22
const XFADE = 4

function chordExpr(freqs) {
  return freqs.map((f) => `0.09*sin(2*PI*${f}*t)+0.03*sin(2*PI*${f * 2}*t)`).join('+')
}

export function addMusic(input, output, seconds) {
  const args = ['-y', '-i', input]
  CHORDS.forEach((c) => args.push('-f', 'lavfi', '-i', `aevalsrc='${chordExpr(c)}':s=44100:d=${SEG}`))
  const segs = CHORDS.map((_, i) => `[${i + 1}:a]afade=t=in:d=${XFADE},afade=t=out:st=${SEG - XFADE}:d=${XFADE}[s${i}]`)
  let chain = '[s0]'
  const cross = CHORDS.slice(1).map((_, i) => {
    const out = i === CHORDS.length - 2 ? '[pad]' : `[x${i}]`
    const f = `${chain}[s${i + 1}]acrossfade=d=${XFADE}${out}`
    chain = out
    return f
  })
  const fx =
    `[pad]atrim=0:${seconds},tremolo=f=0.12:d=0.25,lowpass=f=1400,aecho=0.8:0.7:420|700:0.3|0.2,` +
    `volume=0.55,afade=t=in:d=2.5,afade=t=out:st=${seconds - 4}:d=4[aud]`
  args.push('-filter_complex', [...segs, ...cross, fx].join(';'))
  args.push('-map', '0:v', '-map', '[aud]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', String(seconds), '-movflags', '+faststart', output)
  execFileSync('ffmpeg', args, { stdio: 'ignore' })
}

if (process.argv[1].endsWith('music.mjs')) {
  const [, , inp, out] = process.argv
  const dur = parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', inp]).toString(),
  )
  addMusic(inp, out, dur)
  console.log('wrote', out)
}
