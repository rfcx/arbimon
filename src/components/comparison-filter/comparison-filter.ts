import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { StreamModels } from '@/models'

interface FilterMenuItem {
  id: string
  name: string
}

@Options({
  components: {
    OnClickOutside
  }
})
export default class ComparisonFilterComponent extends Vue {
  currentActivateMenuId = 'sites'

  public get menus (): FilterMenuItem[] {
    return [
      {
        id: 'sites',
        name: 'Sites'
      },
      {
        id: 'times',
        name: 'Time Range'
      }
    ]
  }

  public get streams (): StreamModels.Stream[] {
    return [
      {
        id: 'abc',
        name: 'ABC'
      },
      {
        id: 'def',
        name: 'DEF'
      },
      {
        id: 'ghi',
        name: 'GHI'
      }
    ]
  }

  public setActivateMenuId (id: string): void {
    this.currentActivateMenuId = id
  }

  public isCurrentActivate (id: string): boolean {
    return id === this.currentActivateMenuId
  }

  @Emit()
  public apply (): void {
    console.log('filter')
    this.close()
  }

  @Emit()
  public close (): boolean {
    return false
  }
}
