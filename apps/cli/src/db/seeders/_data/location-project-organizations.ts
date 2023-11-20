import { type Organization } from '@rfcx-bio/common/dao/types'

import { type BioEnvironment } from '~/env/types'

const rfcx: Organization = {
  id: 1,
  name: 'Rainforest Connection',
  type: 'non-profit-organization',
  url: 'rfcx.org',
  image: 'https://rfcx.org/wp-content/themes/rainforestconnection/assets/images/favicon/RFCx-Lockup-White.svg'
}

const nu: Organization = {
  id: 2,
  name: 'Naresuan University',
  type: 'research-institution',
  url: 'https://nu.ac.th',
  image: 'https://www.nu.ac.th/wp-content/uploads/2017/06/NULOGO-Download.png'
}

const chingHua: Organization = {
  id: 3,
  name: 'Ching Hua University',
  type: 'research-institution',
  url: 'https://www.tsinghua.edu.cn',
  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tsinghua_University_Logo.svg/800px-Tsinghua_University_Logo.svg.png'
}

export const rawEnvToLocationProjectOrganizations: Record<BioEnvironment, Organization[]> = {
  default: [
    rfcx,
    nu,
    chingHua
  ],
  testing: [
    rfcx,
    nu,
    chingHua
  ],
  staging: [
    rfcx,
    nu,
    chingHua
  ],
  production: [
    rfcx,
    nu,
    chingHua
  ]
}
