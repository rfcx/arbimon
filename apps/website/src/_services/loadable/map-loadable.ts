import { computed, ComputedRef, Ref, unref } from 'vue'

import { Loadable, loadableData } from '~/loadable'

export const mapLoadable = <D1, D2, E = unknown> (input: Loadable<D1, E> | Ref<Loadable<D1, E>>, mapFn: ((d1: D1) => D2)): ComputedRef<Loadable<D2, E>> =>
  computed(() => {
    const loadable = unref(input)
    return (loadable.isData) ? loadableData(mapFn(loadable.data)) : loadable
  })
