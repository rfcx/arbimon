import { type TCountryCode, getCountryData } from 'countries-list'

export const getCountryNames = (codes: string[]): string[] => {
  return codes.map(code => getCountryData(code as TCountryCode).name)
}

export const getCountryLabel = (codes: string[], noOfItemsToShow: number = 3): string => {
  if (codes.length === 0) {
    return 'No site'
  } else if (codes.length === 1) {
    return getCountryData(codes[0] as TCountryCode).name
  }
  const countryNames = getCountryNames(codes)
  if (countryNames.length <= noOfItemsToShow) {
    return countryNames.join(', ')
  }
  return 'Multiple countries'
}
