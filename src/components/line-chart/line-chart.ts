import * as d3 from 'd3'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { LineChartSeries } from '.'

const HEIGHT = 500
const WIDTH = 1000
const MARGINS = { top: 20, right: 30, bottom: 30, left: 40 }

export default class LineChart extends Vue {
  @Prop() domId!: string
  @Prop() datasets: LineChartSeries[] = [ // TODO 20: Inject real datasets
    {
      color: '#499FE6',
      data: {
        2: 10,
        3: 12,
        4: 20,
        9: 90,
        10: 110,
        12: 100,
        13: 200
      }
    }
  ]

  get hasData (): boolean { return this.datasets.length > 0 }

  mounted (): void {
    this.updateChart()
  }

  @Watch('datasets') onDataChange (): void {
    this.updateChart()
  }

  updateChart (): void {
    const chart = this.generateChart()
    if (!chart) return
    document.getElementById(this.domId)?.appendChild(chart)
  }

  // TODO 20 - Move this out of the component
  generateChart (): SVGSVGElement | null {
    // Prepare data
    const maxY = this.datasets.reduce((acc, cur) => Math.max(acc, Math.max(...Object.values(cur.data))), 0)
    // TODO 20: Loop all datasets
    const dataset = this.datasets[0]
    const data = dataset.data
    const xSeries = Array.from({ length: 24 }, (_, i) => i) // TODO 20: Also support days, months, etc (currently only hours)

    // Setup axes
    const xScale = d3.scaleLinear()
      .domain([0, 23])
      .range([MARGINS.left, WIDTH - MARGINS.right])

    const xAxis = (g: any): unknown => g
      .attr('transform', `translate(0, ${HEIGHT - MARGINS.bottom})`)
      .call(d3.axisBottom(xScale).ticks(xSeries.length).tickSizeOuter(0))

    const yScale = d3.scaleLinear()
      .domain([0, maxY]).nice()
      .range([HEIGHT - MARGINS.bottom, MARGINS.top])

    const yAxis = (g: any): unknown => g
      .attr('transform', `translate(${MARGINS.left}, 0)`)
      .call(d3.axisLeft(yScale))

    // Render chart
    const svg = d3.create('svg')
      .attr('viewBox', [0, 0, WIDTH, HEIGHT].join(' '))
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
}
