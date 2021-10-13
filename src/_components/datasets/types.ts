import { Site } from "@/_services/api";
import { Dayjs } from "dayjs";

// TODO 93 - Remove colors & simplify
export interface Filter {
  sites: Site[]
  startDate: Dayjs
  endDate: Dayjs
}

export interface ColoredFilter extends Filter {
  color: string
}
