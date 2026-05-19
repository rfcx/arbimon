import * as d3 from 'd3'
import { type Ref } from 'vue'

import { type SoundscapeItem, type Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

export const doYAxisLayout = (axisY: Ref<SVGSVGElement | null>, visobject: Visobject | SoundscapeItem): void => {
  const d3Yaxis = d3.select(axisY.value)
  const specH: number = visobject.spectrogram.height
  const domain = visobject.domain
  const scaley = visobject.spectrogram.legend.scale.y

  d3Yaxis.style('width', `${visobject.spectrogram.legend.axis_sizew as number}`)
  d3Yaxis.style('height', specH + (visobject.spectrogram.legend.axis_margin_top as number))
  d3Yaxis.style('scale', 'none')
  d3Yaxis.append('rect')
    .attr('class', 'block')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', `${visobject.spectrogram.legend.axis_sizew as number}`)
    .attr('height', `${specH + (visobject.spectrogram.legend.axis_sizeh as number)}`)
  d3Yaxis.append('g')
    .attr('class', 'axis')
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    .attr('transform', `translate(${visobject.spectrogram.legend.axis_sizew as number}, ${visobject.spectrogram.legend.axis_lead as number})`)
    .call(makeAxis(domain.y, scaley, 'left'))
}

export const doXAxisLayout = (axisX: Ref<SVGSVGElement | null>, visobject: Visobject | SoundscapeItem): void => {
  const d3XAxis = d3.select(axisX.value)
  const specH: number = visobject.spectrogram.height
  const specW: number = visobject.spectrogram.width
  const domain = visobject.domain
  const scalex = visobject.spectrogram.legend.scale.x

  d3XAxis.style('height', visobject.spectrogram.legend.axis_sizeh)
  d3XAxis.style('width', specW + (visobject.spectrogram.legend.axis_margin_x as number))
  d3XAxis.style('scale', 'none')
  d3XAxis.style('top', `${specH + (visobject.spectrogram.legend.axis_lead as number)}`)
  d3XAxis.style('left', 45)
  d3XAxis.append('rect')
    .attr('class', 'block')
    .attr('x', 0)
    .attr('y', 1)
    .attr('width', specW)
    .attr('height', `${visobject.spectrogram.legend.axis_sizeh as number}`)
  d3XAxis.append('g')
    .attr('class', 'axis')
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    .attr('transform', 'translate(' + visobject.spectrogram.legend.axis_lead + ', 1)')
    .call(makeAxis(domain.x, scalex, 'bottom'))
}

export interface DomainConfig {
  ticks?: number
  tick_format?: (d: any) => string
  unit_format?: (d: any) => string
}

export type Orientation = 'top' | 'right' | 'bottom' | 'left'

export const makeAxis = (domain: DomainConfig, scale: d3.AxisScale<d3.AxisDomain>, orientation: Orientation): d3.Axis<d3.AxisDomain> => {
  let axis: d3.Axis<d3.AxisDomain>
  switch (orientation) {
    case 'bottom':
      axis = d3.axisBottom(scale)
      break
    case 'top':
      axis = d3.axisTop(scale)
      break
    case 'left':
      axis = d3.axisLeft(scale)
      break
    case 'right':
      axis = d3.axisRight(scale)
      break
    default:
      axis = d3.axisBottom(scale)
  }
  if (domain.ticks != null) {
    axis.ticks(domain.ticks)
  }
  if (domain.tick_format) {
    axis.tickFormat(domain.tick_format as any)
  } else if (domain.unit_format) {
    axis.tickFormat(domain.unit_format as any)
  }

  return axis
}

export const makeScale = (domain: any, range: number[]): d3.ScaleLinear<number, number, never> => {
  const scale = d3.scaleLinear()
    .domain([domain.from, domain.to])
    .range(range)
  // TODO: update this part for the soundscape
  // let s
  // if(domain.ordinal){
  //     var dd = domain.to - domain.from;
  //     var dr = range[1] - range[0];
  //     var scale = dr / dd;
  //     s = d3.scale.linear().domain([domain.from, domain.to]).range([
  //         scale/2 + range[0], range[1] - scale/2
  //     ]);
  // } else {
  //     s = d3.scale.linear().domain([domain.from, domain.to]).range(range);
  // }
  return scale
}
