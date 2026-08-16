import { applyAvatarEyeDefaults, createAvatar } from '@/features/avatar/avatars'
import { createInitialSequences } from '@/features/animation/sequences'
import { poseFromExpression, renderAvatar } from '@/features/avatar/geometry'
import { defaultExpression, initialExpressions } from '@/features/avatar/presets'
import {
  createStudioDocumentStore,
  loadStudioDocument,
  parseImportedStudioDocument,
  serializeStudioDocument,
  type StudioDocument,
} from '@/features/studio/studioDocument'

const documentFixture = (): StudioDocument => {
  const avatar = createAvatar('Strobi')
  return {
    version: 2,
    library: {
      activeAvatarId: avatar.id,
      avatars: [avatar],
    },
    expressions: initialExpressions,
    sequences: createInitialSequences(),
    playback: { stateId: 'idle', playing: true },
  }
}

describe('Studio document', () => {
  const storage = (value: string | null = null) => ({ getItem: () => value })

  it('loads the bundled Studio snapshot when no local project exists', () => {
    const document = loadStudioDocument(storage())

    expect(document.library.avatars).toHaveLength(13)
    expect(document.library.activeAvatarId).toBe('radar')
    expect(document.library.avatars[0].id).toBe('radar')
    expect(document.library.avatars[0].name).toBe('Radar')
    expect(document.library.avatars[1]).toMatchObject({
      id: 'antonio',
      name: 'Antonio',
    })
    expect(document.library.avatars[2]).toMatchObject({
      id: 'wiipo',
      name: 'Wiipo',
    })
    expect(
      document.library.avatars.some(avatar => avatar.id === 'strobi' && avatar.name === 'Strobi')
    ).toBe(true)
    expect(document.expressions).toHaveLength(27)
    expect(document.sequences).toHaveLength(23)
    expect(document.playback).toEqual({ stateId: 'proud', playing: true })
  })

  it('bundles Antonio as a selectable person mascot without replacing Radar', () => {
    const document = loadStudioDocument(storage())
    const antonio = document.library.avatars.find(avatar => avatar.id === 'antonio')

    expect(document.library.activeAvatarId).toBe('radar')
    expect(document.library.avatars[0].id).toBe('radar')
    expect(antonio).toMatchObject({
      id: 'antonio',
      name: 'Antonio',
      colors: { body: '#353535', eyes: '#e4e0d6' },
    })
    expect(antonio?.body.primary.type).toBe('cube')
    expect(antonio?.body.nodes).toHaveLength(1)
    expect(antonio?.body.nodes[0]).toMatchObject({
      id: 'antonio-peak',
      name: 'Peak',
    })
    expect(antonio?.body.nodes[0].surface.type).toBe('diamond')
    expect(antonio?.body.nodes.some(node => /dish|antenna/i.test(node.id + node.name))).toBe(false)
    expect(antonio?.behavior).toBeUndefined()
    expect(antonio?.colors.body).not.toBe('#1c1c1c')
    expect(antonio?.colors.eyes).not.toBe('#e8a54b')
  })

  it('bundles Wiipo as a selectable coral block mascot without replacing Radar', () => {
    const document = loadStudioDocument(storage())
    const wiipo = document.library.avatars.find(avatar => avatar.id === 'wiipo')
    const nodeIds = wiipo?.body.nodes.map(node => node.id) ?? []

    expect(document.library.activeAvatarId).toBe('radar')
    expect(document.library.avatars[0].id).toBe('radar')
    expect(document.library.avatars[1].id).toBe('antonio')
    expect(wiipo).toMatchObject({
      id: 'wiipo',
      name: 'Wiipo',
      colors: { body: '#F4A6A3', eyes: '#111316' },
      renderStyle: { type: 'vector' },
    })
    expect(wiipo?.body.primary.type).toBe('cube')
    expect(wiipo?.body.primary.roundness).toBeGreaterThanOrEqual(0.7)
    expect(wiipo?.body.primary.width).toBeGreaterThan(wiipo?.body.primary.height ?? 0)
    expect(wiipo?.body.primary.width).toBeGreaterThan(wiipo?.body.primary.depth ?? 0)
    expect(nodeIds).toEqual([
      'wiipo-ear-left',
      'wiipo-ear-right',
      'wiipo-foot-left',
      'wiipo-foot-right',
      'wiipo-tail',
      'wiipo-nose',
    ])
    expect(wiipo?.body.nodes.every(node => node.surface.roundness >= 0.7)).toBe(true)
    expect(wiipo?.body.nodes.filter(node => node.id.startsWith('wiipo-ear-'))).toHaveLength(2)
    expect(wiipo?.body.nodes.filter(node => node.id.startsWith('wiipo-foot-'))).toHaveLength(2)
    const leftEar = wiipo?.body.nodes.find(node => node.id === 'wiipo-ear-left')
    const rightEar = wiipo?.body.nodes.find(node => node.id === 'wiipo-ear-right')
    const leftFoot = wiipo?.body.nodes.find(node => node.id === 'wiipo-foot-left')
    const rightFoot = wiipo?.body.nodes.find(node => node.id === 'wiipo-foot-right')
    const tail = wiipo?.body.nodes.find(node => node.id === 'wiipo-tail')
    const nose = wiipo?.body.nodes.find(node => node.id === 'wiipo-nose')
    expect(leftEar?.surface.type).toBe('capsule')
    expect(rightEar?.surface.type).toBe('capsule')
    expect(leftFoot?.surface.type).toBe('sphere')
    expect(rightFoot?.surface.type).toBe('sphere')
    expect(tail?.surface.type).toBe('sphere')
    expect(nose?.surface.type).toBe('sphere')
    expect(leftEar && rightEar && leftEar.position[0] < 0 && rightEar.position[0] > 0).toBe(true)
    expect(leftEar && rightEar && rightEar.position[0] - leftEar.position[0]).toBeGreaterThan(
      leftEar?.surface.width ?? 0
    )
    expect(leftEar && leftEar.position[1] < 0).toBe(true)
    expect(leftFoot && rightFoot && leftFoot.position[1] > 0 && rightFoot.position[1] > 0).toBe(
      true
    )
    expect(tail && tail.position[2] < 0).toBe(true)
    expect(nose && nose.position[2] > 0).toBe(true)
    expect(wiipo?.eyes.heightLeft).toBeGreaterThan(wiipo?.eyes.widthLeft ?? 0)
    expect(wiipo?.eyes.heightRight).toBeGreaterThan(wiipo?.eyes.widthRight ?? 0)
    expect(wiipo?.behavior).toBeUndefined()
    expect(wiipo?.colors.body).not.toBe('#1c1c1c')
    expect(wiipo?.colors.eyes).not.toBe('#e8a54b')

    const geometry = renderAvatar(
      poseFromExpression(applyAvatarEyeDefaults(defaultExpression, wiipo!.eyes)),
      wiipo!.body.primary,
      1,
      { bodyNodes: wiipo!.body.nodes }
    )
    expect(geometry.headPath).toMatch(/^M/)
    expect(geometry.leftPath).toMatch(/^M/)
    expect(geometry.rightPath).toMatch(/^M/)
    expect(geometry.leftVisible).toBe(true)
    expect(geometry.rightVisible).toBe(true)
    expect([...geometry.backNodeIds, ...geometry.frontNodeIds]).toEqual(
      expect.arrayContaining([
        'wiipo-ear-left',
        'wiipo-ear-right',
        'wiipo-foot-left',
        'wiipo-foot-right',
        'wiipo-tail',
        'wiipo-nose',
      ])
    )
  })

  it('keeps a locally saved project authoritative over the bundled snapshot', () => {
    const localDocument = documentFixture()
    const loaded = loadStudioDocument(storage(JSON.stringify(localDocument)))

    expect(loaded.library.activeAvatarId).toBe(localDocument.library.activeAvatarId)
    expect(loaded.library.avatars[0]).toEqual(localDocument.library.avatars[0])
    expect(loaded.expressions).toEqual(localDocument.expressions)
    expect(loaded.sequences).toEqual(localDocument.sequences)
    expect(loaded.playback).toEqual(localDocument.playback)
  })

  it('appends bundled avatars that are missing from a saved library', () => {
    const bundled = loadStudioDocument(storage())
    const userAvatar = createAvatar('Custom')
    const savedAvatars = [
      ...bundled.library.avatars.filter(avatar => avatar.id !== 'antonio' && avatar.id !== 'wiipo'),
      userAvatar,
    ]
    const saved: StudioDocument = {
      ...bundled,
      library: {
        activeAvatarId: 'radar',
        avatars: savedAvatars,
      },
      playback: { stateId: 'idle', playing: false },
    }

    const loaded = loadStudioDocument(storage(JSON.stringify(saved)))

    expect(loaded.library.activeAvatarId).toBe('radar')
    expect(loaded.library.avatars.map(avatar => avatar.id)).toEqual([
      ...savedAvatars.map(avatar => avatar.id),
      'antonio',
      'wiipo',
    ])
    expect(loaded.library.avatars.find(avatar => avatar.id === 'antonio')).toMatchObject({
      id: 'antonio',
      name: 'Antonio',
    })
    expect(loaded.library.avatars.find(avatar => avatar.id === 'wiipo')).toMatchObject({
      id: 'wiipo',
      name: 'Wiipo',
    })
    expect(loaded.library.avatars.find(avatar => avatar.id === userAvatar.id)).toEqual(userAvatar)
    expect(loaded.expressions).toEqual(saved.expressions)
    expect(loaded.sequences).toEqual(saved.sequences)
    expect(loaded.playback).toEqual({ stateId: 'idle', playing: false })
  })

  it('does not overwrite a saved avatar that shares a bundled id', () => {
    const bundled = loadStudioDocument(storage())
    const editedAntonio = {
      ...bundled.library.avatars.find(avatar => avatar.id === 'antonio')!,
      name: 'Antonio edited',
      colors: { body: '#123456', eyes: '#abcdef' },
    }
    const saved: StudioDocument = {
      ...bundled,
      library: {
        activeAvatarId: 'radar',
        avatars: bundled.library.avatars
          .filter(avatar => avatar.id !== 'wiipo')
          .map(avatar => (avatar.id === 'antonio' ? editedAntonio : avatar)),
      },
    }

    const loaded = loadStudioDocument(storage(JSON.stringify(saved)))

    expect(loaded.library.activeAvatarId).toBe('radar')
    expect(loaded.library.avatars.find(avatar => avatar.id === 'antonio')).toEqual(editedAntonio)
    expect(loaded.library.avatars.find(avatar => avatar.id === 'wiipo')).toMatchObject({
      id: 'wiipo',
      name: 'Wiipo',
    })
  })

  it('appends missing bundled avatars when importing a project', () => {
    const bundled = loadStudioDocument(storage())
    const userAvatar = createAvatar('Imported')
    const imported = parseImportedStudioDocument(
      serializeStudioDocument({
        ...bundled,
        library: {
          activeAvatarId: userAvatar.id,
          avatars: [userAvatar],
        },
      }),
      bundled
    )

    expect(imported.library.activeAvatarId).toBe(userAvatar.id)
    expect(imported.library.avatars[0]).toEqual(userAvatar)
    expect(imported.library.avatars.some(avatar => avatar.id === 'antonio')).toBe(true)
    expect(imported.library.avatars.some(avatar => avatar.id === 'wiipo')).toBe(true)
    expect(imported.expressions).toEqual(bundled.expressions)
    expect(imported.sequences).toEqual(bundled.sequences)
    expect(imported.playback).toEqual(bundled.playback)
  })

  it('persists one coherent document after a mutation', () => {
    const persisted: StudioDocument[] = []
    const store = createStudioDocumentStore(documentFixture(), value => persisted.push(value))

    store.update({ playback: { stateId: 'idle', playing: false } })

    expect(persisted).toHaveLength(1)
    expect(persisted[0].playback).toEqual({ stateId: 'idle', playing: false })
    expect(persisted[0].expressions).toHaveLength(initialExpressions.length)
  })

  it('repairs sequence references in the same transaction as expression deletion', () => {
    const store = createStudioDocumentStore(documentFixture(), () => undefined)
    const remainingExpressions = initialExpressions.slice(1)

    const next = store.update({ expressions: remainingExpressions })

    expect(
      next.sequences.every(sequence =>
        sequence.steps.every(step =>
          remainingExpressions.some(item => item.id === step.expressionId)
        )
      )
    ).toBe(true)
  })

  it('round-trips a complete project document as portable JSON', () => {
    const document = documentFixture()
    const expression = { ...initialExpressions[0], widthLeft: 42 }
    const sequence = {
      ...createInitialSequences()[0],
      steps: createInitialSequences()[0].steps.map(step => ({
        ...step,
        expressionId: expression.id,
      })),
    }
    document.library.avatars[0].behavior = {
      expressions: [expression],
      sequences: [sequence],
    }

    const imported = parseImportedStudioDocument(serializeStudioDocument(document), document)

    expect(imported).toEqual(document)
    expect(imported.library.avatars[0].behavior?.expressions[0].widthLeft).toBe(42)
  })

  it('keeps the base library unchanged when an avatar owns customized behavior', () => {
    const document = documentFixture()
    const avatar = document.library.avatars[0]
    const customized = {
      ...avatar,
      behavior: {
        expressions: [{ ...initialExpressions[0], widthLeft: 47 }],
        sequences: createInitialSequences().slice(0, 1),
      },
    }
    const store = createStudioDocumentStore(document, () => undefined)

    const next = store.update({
      library: { activeAvatarId: avatar.id, avatars: [customized] },
    })

    expect(next.expressions[0].widthLeft).toBe(initialExpressions[0].widthLeft)
    expect(next.library.avatars[0].behavior?.expressions[0].widthLeft).toBe(47)
  })

  it('rejects files that are not versioned Studio projects', () => {
    const fallback = documentFixture()

    expect(() => parseImportedStudioDocument('{"version":1}', fallback)).toThrow(
      'Unsupported Avatar Studio project'
    )
    expect(() => parseImportedStudioDocument('{broken', fallback)).toThrow(
      'Invalid Avatar Studio project'
    )
  })

  it('repairs an imported active avatar and missing expression references', () => {
    const fallback = documentFixture()
    const avatar = createAvatar('Portable')
    const imported = parseImportedStudioDocument(
      JSON.stringify({
        ...fallback,
        library: { activeAvatarId: 'missing', avatars: [avatar] },
        sequences: [
          {
            ...createInitialSequences()[0],
            steps: [{ ...createInitialSequences()[0].steps[0], expressionId: 'missing' }],
          },
        ],
      }),
      fallback
    )

    expect(imported.library.activeAvatarId).toBe(avatar.id)
    expect(imported.sequences[0].steps[0].expressionId).toBe(imported.expressions[0].id)
  })

  it('sanitizes imported animation timing and playback values', () => {
    const fallback = documentFixture()
    const imported = parseImportedStudioDocument(
      JSON.stringify({
        ...fallback,
        sequences: [
          {
            ...fallback.sequences[0],
            playbackMode: 'unsupported',
            steps: [
              {
                ...fallback.sequences[0].steps[0],
                holdMs: -500,
                transitionMs: Number.POSITIVE_INFINITY,
              },
            ],
          },
        ],
      }),
      fallback
    )

    expect(imported.sequences[0].playbackMode).toBe('loop')
    expect(imported.sequences[0].steps[0].holdMs).toBeGreaterThanOrEqual(100)
    expect(Number.isFinite(imported.sequences[0].steps[0].transitionMs)).toBe(true)
  })
})
