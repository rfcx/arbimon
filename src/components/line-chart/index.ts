import * as d3 from 'd3'

export interface LineChartConfig {
  height: number
  width: number
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface LineChartSeries {
  color: string
  data: { [x: number]: number }
}

export const generateChart = (xSeries: number[], datasets: LineChartSeries[], config: LineChartConfig): SVGSVGElement | null => {
  // Prepare data
  const maxY = datasets.reduce((acc, cur) => Math.max(acc, Math.max(...Object.values(cur.data))), 0)
  // TODO 20: Loop all datasets
  const dataset = datasets[0]
  const data = dataset.data

  // Setup axes
  const xScale = d3.scaleLinear()
    .domain([0, xSeries.length - 1])
    .range([config.margins.left, config.width - config.margins.right])

  const xAxis = (g: any): unknown => g
    .attr('transform', `translate(0, ${config.height - config.margins.bottom})`)
    .call(d3.axisBottom(xScale).ticks(xSeries.length).tickSizeOuter(0))

  const yScale = d3.scaleLinear()
    .domain([0, maxY]).nice()
    .range([config.height - config.margins.bottom, config.margins.top])

  const yAxis = (g: any): unknown => g
    .attr('transform', `translate(${config.margins.left}, 0)`)
    .call(d3.axisLeft(yScale))

  // Render chart
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, config.width, config.height].join(' '))
    .attr('fill', 'none')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')

  svg.append('g').call(xAxis)
  svg.append('g').call(yAxis)

  // Render lines
  const line = d3.line<number>()
    .defined(d => d in data)
    .x(x => xScale(x))
    .y(x => yScale(data[x] ?? NaN))

  svg.append('path')
    .datum(xSeries.filter(line.defined()))
    .attr('d', line)
    .attr('stroke', '#999')
    .attr('stroke-width', 1)
    .style('stroke-dasharray', ('3, 3'))
    .style('opacity', 50)

  svg.append('path')
    .datum(xSeries)
    .attr('d', line)
    .attr('stroke', dataset.color)
    .attr('stroke-width', 3)

  return svg.node()
}
