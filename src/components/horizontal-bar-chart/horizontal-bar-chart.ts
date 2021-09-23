import * as d3 from 'd3'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'

const MARGIN = { top: 20, right: 20, bottom: 30, left: 80 }
const barHeight = 40

export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] })
  public chartData!: ChartModels.BarChartItem[]

  public get hasData (): boolean {
    return this.chartData.length > 0
  }

  @Watch('chartData')
  onChartDataChange (): void {
    this.generateChart()
  }

  public generateChart (): void {
    const data = this.chartData.sort((a, b) => a.label.localeCompare(b.label))
    const maximumPopulation = Math.max(...data.map(datum => datum.population))

    const fullWidth = document.getElementById('horizontal-bar-chart-component')?.clientWidth ?? 0 - MARGIN.left
    const chartWidth = fullWidth - MARGIN.left - MARGIN.right
    const fullHeight = (data.length + 1) * barHeight
    const chartHeight = fullHeight - MARGIN.top - MARGIN.bottom

    const chart: d3.Selection<SVGGElement, unknown, HTMLElement, unknown> = d3.select('#multi-bar-chart')
    chart.selectAll('*').remove()

    const svg = chart
      .append('svg')
      .attr('width', fullWidth)
      .attr('height', fullHeight)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, maximumPopulation])
      .range([0, chartWidth])
      .nice()

    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d, _) => {
        return d.valueOf() % 1 !== 0 ? '' : d3.format('d')(d)
      })
      .tickSize(0)
      .tickPadding(10)

    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .transition()
      .call(xAxis)

    const yScale = d3.scaleBand()
      .domain(d3.map(data, (d) => d.label))
      .range([0, chartHeight])
      .paddingInner(0.2)

    const yAxis = d3.axisLeft(yScale)
      .tickSize(0)
      .tickPadding(5)

    svg.append('g')
      .transition()
      .call(yAxis)

    // scale color line
    svg.selectAll('.domain')
      .style('stroke', 'none')

    svg.selectAll('text')
      .style('color', 'white')
      .style('font-size', '14px')

    svg.selectAll('line')
      .style('color', 'none')

    // bar label group
    svg.append('g')
      .selectAll('myRect')
      .data(data)
      .enter()
      .append('rect')
      .style('margin-top', '10px')
      .attr('x', xScale(0))
      .attr('y', (d) => yScale(d.label) ?? 0)
      .attr('width', (d) => xScale(d.population))
      .attr('height', yScale.bandwidth())
      .attr('fill', '#31984F')

    // population label group
    const textSize = { width: 50, height: 10 }
    svg.append('g')
      .selectAll('myRect')
      .data(data)
      .enter()
      .append('text')
      .text((d) => d.population)
      .attr('fill', 'white')
      .attr('width', textSize.width)
      .attr('height', textSize.height)
      .attr('x', (d) => xScale(d.population) - textSize.width / 2)
      .attr('y', (d) => (yScale(d.label) ?? 0) + yScale.bandwidth() / 2 + textSize.height / 2)
  }
}
