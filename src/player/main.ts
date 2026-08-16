import { createRadarPlayerDocument } from '@/features/player/radarPayload'
import { mountRadarPlayer } from '@/features/player/mountRadarPlayer'
import './player.css'

const root = document.getElementById('radar')
if (!root) throw new Error('Radar player root was not found.')

const background = new URLSearchParams(window.location.search).get('bg')
document.documentElement.dataset.bg = background === 'transparent' ? 'transparent' : 'dark'

const player = mountRadarPlayer(root, createRadarPlayerDocument())
player.play()
