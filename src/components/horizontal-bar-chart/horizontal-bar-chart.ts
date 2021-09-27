import * as d3 from 'd3'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'

const MARGIN = { top: 20, right: 20, bottom: 30, left: 80 }

export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] })
  public chartData!: ChartModels.GroupedBarChartItem[]

  public get hasData (): boolean {
    return this.chartData.length > 0
  }

  @Watch('chartData', { deep: true })
  onChartDataChange (): void {
    this.generateGroupedChart()
  }

  public generateGroupedChart (): void {
    const data = this.chartData

    const maximumFrequency = Math.max(...data.map(d => Math.max(...d.series.map(v => v.frequency))))

    const colors = ['#31984F', '#FEED59', '#FF89D0', '#FFFFFF', '#75BDFF']
    const barHeight = 30
    const barMargin = 0
    const groupHeight = Array.isArray(data) && data.length > 0 ? data[0].series.length * barHeight : 0 /** bar chart group y axis height */
    const groupMargin = 30
    const fullWidth = (document.getElementById('horizontal-bar-chart-component')?.clientWidth ?? 0) - MARGIN.left
    const chartWidth = fullWidth - MARGIN.left - MARGIN.right
    const chartHeight = (data.length * groupHeight) + (data.length * barMargin) + groupMargin
    const fullHeight = chartHeight + MARGIN.top + MARGIN.bottom

    const chart: d3.Selection<SVGGElement, unknown, HTMLElement, unknown> = d3.select('#multi-bar-chart')
    chart.selectAll('*').remove()

    const svg = d3.select('#multi-bar-chart')
      .append('svg')
      .attr('width', fullWidth)
      .attr('height', fullHeight)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    // =================== Scale setting =================
    // xScale configuration: d3 calculate the x number
    const xScale = d3.scaleLinear()
      .domain([0, maximumFrequency])
      .range([0, chartWidth])
      .nice()

    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d, _) => {
        return d.valueOf() % 1 !== 0 ? '' : d3.format('d')(d)
      })
      .tickSize(0)
      .tickPadding(5)

    svg.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .transition()
      .call(xAxis)

    const yScale = d3.scaleBand()
      .domain(d3.map(data, (d) => d.category))
      .range([0, chartHeight])

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

    // =================== Generate bar group =================
    svg.selectAll('g.category')
      .data(data)
      .enter()
      .append('g')
      .classed('category', true)
      .attr('transform', (d, i) => {
        // Center the group bar chart to label
        const y = (yScale(d.category) ?? 0) + (barHeight * (-0.5 + (0.5 * (d.series.length - 1))))
        return `translate(0,${y})`
      })
      .each(function (d) {
        const category = d3.select(this)
        for (let idx = 0; idx < d.series.length; idx++) {
          const x = xScale(d.series[idx].frequency)
          const width = x - xScale(0)
          const y = (d.series.length / 2 - idx) * (barHeight + barMargin)
          category.append('rect')
            .attr('x', xScale(0))
            .attr('y', y)
            .attr('width', width)
            .attr('height', barHeight)
            .style('fill', colors[idx])

          const textSize = { width: 30, height: 10 }
          category.append('text')
            .text(d.series[idx].frequency)
            .attr('width', textSize.width)
            .attr('height', textSize.height)
            .attr('x', width - textSize.width)
            .attr('y', y + (barHeight / 2) + 5)
        }
      })
  }
}
