import {
  advancePlaybackTimeline,
  beginPlayback,
  createPlaybackTimeline,
  schedulePlaybackBlink,
  schedulePlaybackStep,
  type PlaybackTimeline,
} from '@/features/animation/playback'
import type { SequenceTransition } from '@/features/animation/sequences'
import {
  ambientBodyOffset,
  ambientEyeOffset,
  applyAmbientBodyMotion,
  hasAmbientMotion,
} from '@/features/avatar/ambientMotion'
import {
  interpolatePose,
  poseFromExpression,
  renderAvatar,
  type Expression,
} from '@/features/avatar/geometry'
import type { RadarPlayerDocument } from './radarPayload'

const SVG_NS = 'http://www.w3.org/2000/svg'

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const easeProgress = (progress: number, transition: SequenceTransition) =>
  transition === 'smooth'
    ? progress * progress * (3 - 2 * progress)
    : transition === 'snappy'
      ? 1 - (1 - progress) ** 3
      : 1 - Math.exp(-6 * progress) * Math.cos(8 * progress)

const nearestAngle = (target: number, current: number) => {
  let resolved = target
  while (resolved - current > 180) resolved -= 360
  while (resolved - current < -180) resolved += 360
  return resolved
}

const withNearestAngles = (target: Expression, current: Expression): Expression => ({
  ...target,
  headX: nearestAngle(target.headX, current.headX),
  headY: nearestAngle(target.headY, current.headY),
  headZ: nearestAngle(target.headZ, current.headZ),
  leftAngle: nearestAngle(target.leftAngle, current.leftAngle),
  rightAngle: nearestAngle(target.rightAngle, current.rightAngle),
})

const svgElement = <Name extends keyof SVGElementTagNameMap>(name: Name) =>
  document.createElementNS(SVG_NS, name)

export type RadarPlayerHandle = {
  element: SVGSVGElement
  play: () => void
  destroy: () => void
}

export const mountRadarPlayer = (
  target: Element,
  documentPayload: RadarPlayerDocument
): RadarPlayerHandle => {
  const { avatar, sequence, expressions } = documentPayload
  const firstStep = sequence.steps[0]
  const firstExpression = expressions[firstStep.expressionId]
  if (!firstExpression) throw new Error('Radar idle animation is missing its first expression.')

  const clipId = `radar-clip-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`
  const svg = svgElement('svg')
  svg.setAttribute('viewBox', '-150 -150 300 300')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', avatar.name)
  const defs = svgElement('defs')
  const clipPath = svgElement('clipPath')
  const clipHead = svgElement('path')
  clipPath.id = clipId
  clipPath.append(clipHead)
  defs.append(clipPath)
  const motionLayer = svgElement('g')
  const backLayer = svgElement('g')
  const head = svgElement('path')
  const eyesLayer = svgElement('g')
  const leftEye = svgElement('path')
  const rightEye = svgElement('path')
  const frontLayer = svgElement('g')
  eyesLayer.setAttribute('clip-path', `url(#${clipId})`)
  eyesLayer.append(leftEye, rightEye)
  motionLayer.append(backLayer, head, eyesLayer, frontLayer)
  svg.append(defs, motionLayer)
  target.replaceChildren(svg)

  const colors = { ...avatar.colors }
  let currentPose = poseFromExpression(firstExpression)
  let blinkAmount = 1
  let timeline: PlaybackTimeline = createPlaybackTimeline()
  let frameRequest: number | null = null
  let stepTimer: ReturnType<typeof setTimeout> | null = null
  let blinkTimer: ReturnType<typeof setTimeout> | null = null
  let transition: {
    from: ReturnType<typeof poseFromExpression>
    to: ReturnType<typeof poseFromExpression>
    startedAt: number
    durationMs: number
    transition: SequenceTransition
  } | null = null
  let blinkState: { startedAt: number; durationMs: number } | null = null
  let lastAmbientFrame = 0

  const syncPaths = (group: SVGGElement, paths: string[], fill: string) => {
    while (group.childElementCount < paths.length) group.append(svgElement('path'))
    while (group.childElementCount > paths.length) group.lastElementChild?.remove()
    paths.forEach((path, index) => {
      const node = group.children[index]
      if (!(node instanceof SVGPathElement)) return
      node.setAttribute('d', path)
      node.setAttribute('fill', fill)
    })
  }

  const render = (time = performance.now()) => {
    const bodyElapsed = time
    const expression = hasAmbientMotion(currentPose.expression)
      ? applyAmbientBodyMotion(currentPose.expression, bodyElapsed)
      : currentPose.expression
    const geometry = renderAvatar(
      poseFromExpression(expression),
      avatar.body.primary,
      blinkAmount,
      {
        includeWire: false,
        bodyNodes: avatar.body.nodes,
        eyeOffset: ambientEyeOffset(currentPose.expression, bodyElapsed),
      }
    )
    const offset = ambientBodyOffset(currentPose.expression, bodyElapsed)
    motionLayer.setAttribute('transform', `translate(${offset.x} ${offset.y})`)
    syncPaths(backLayer, geometry.backPaths, colors.body)
    syncPaths(frontLayer, geometry.frontPaths, colors.body)
    head.setAttribute('d', geometry.headPath)
    head.setAttribute('fill', colors.body)
    clipHead.setAttribute('d', geometry.headPath)
    leftEye.setAttribute('d', geometry.leftPath)
    rightEye.setAttribute('d', geometry.rightPath)
    leftEye.setAttribute('fill', colors.eyes)
    rightEye.setAttribute('fill', colors.eyes)
    leftEye.style.display = geometry.leftVisible ? '' : 'none'
    rightEye.style.display = geometry.rightVisible ? '' : 'none'
  }

  const requestTick = () => {
    if (frameRequest === null) frameRequest = requestAnimationFrame(tick)
  }

  const tick = (time: number) => {
    frameRequest = null
    if (transition) {
      const linear = clamp01((time - transition.startedAt) / Math.max(transition.durationMs, 1))
      const eased = easeProgress(linear, transition.transition)
      currentPose = interpolatePose(transition.from, transition.to, eased)
      if (linear >= 1) transition = null
    }
    if (blinkState) {
      const progress = clamp01((time - blinkState.startedAt) / blinkState.durationMs)
      blinkAmount =
        progress <= 0.42 ? 1 - (progress / 0.42) ** 2 : 1 - (1 - (progress - 0.42) / 0.58) ** 2
      if (progress >= 1) {
        blinkAmount = 1
        blinkState = null
      }
    }
    const ambientActive = hasAmbientMotion(currentPose.expression)
    if (transition || blinkState || !ambientActive || time - lastAmbientFrame >= 1000 / 30) {
      render(time)
      if (ambientActive) lastAmbientFrame = time
    }
    if (transition || blinkState || ambientActive) requestTick()
  }

  const animateTo = (
    expression: Expression,
    durationMs: number,
    transitionStyle: SequenceTransition
  ) => {
    const resolved = withNearestAngles(expression, currentPose.expression)
    const targetPose = poseFromExpression(resolved)
    if (durationMs <= 0) {
      transition = null
      currentPose = targetPose
      render()
      return
    }
    transition = {
      from: currentPose,
      to: targetPose,
      startedAt: performance.now(),
      durationMs,
      transition: transitionStyle,
    }
    requestTick()
  }

  const clearSchedule = () => {
    if (stepTimer !== null) clearTimeout(stepTimer)
    if (blinkTimer !== null) clearTimeout(blinkTimer)
    stepTimer = null
    blinkTimer = null
  }

  const playCurrentStep = () => {
    const step = sequence.steps[timeline.position]
    const expression = expressions[step.expressionId]
    if (!expression) return
    animateTo(expression, step.transitionMs, step.transition)
    const duration = step.transitionMs + step.holdMs
    timeline = schedulePlaybackStep(timeline, performance.now(), duration)
    stepTimer = setTimeout(advance, duration)
  }

  const advance = () => {
    const advanced = advancePlaybackTimeline(timeline, sequence)
    timeline = advanced.timeline
    if (advanced.cursor.complete) return
    playCurrentStep()
  }

  const scheduleBlink = (delayMs: number) => {
    if (!sequence.blink.enabled) return
    timeline = schedulePlaybackBlink(timeline, performance.now(), delayMs)
    blinkTimer = setTimeout(() => {
      blinkState = { startedAt: performance.now(), durationMs: sequence.blink.durationMs }
      requestTick()
      const range = sequence.blink.maxIntervalMs - sequence.blink.minIntervalMs
      scheduleBlink(
        sequence.blink.durationMs + sequence.blink.minIntervalMs + Math.random() * range
      )
    }, delayMs)
  }

  const play = () => {
    clearSchedule()
    blinkAmount = 1
    blinkState = null
    timeline = beginPlayback(createPlaybackTimeline())
    playCurrentStep()
    scheduleBlink(sequence.blink.initialDelayMs)
  }

  const destroy = () => {
    clearSchedule()
    if (frameRequest !== null) cancelAnimationFrame(frameRequest)
    svg.remove()
  }

  render()
  return { element: svg, play, destroy }
}
