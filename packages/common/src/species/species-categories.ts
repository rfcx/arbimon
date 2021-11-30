export function getSpeciesCategory (category: string): string {
  switch (category) {
    case 'EX': return 'Extinct'
    case 'EW': return 'Extinct in the wild'
    case 'RE': return 'Regionally extinct'
    case 'CR': return 'Critically endangered'
    case 'EN': return 'Endangered'
    case 'VU': return 'Vulnerable'
    case 'NT': return 'Near threatened'
    case 'LC': return 'Least concern'
    case 'DD': return 'Data deficient'
    case 'NA': return 'Not applicable'
    default: return 'Not evaluated' // 'NE'
  }
}
