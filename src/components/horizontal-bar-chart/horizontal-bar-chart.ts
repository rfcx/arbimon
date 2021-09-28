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
    const dataLength = data.length
    const dataSeriesLength = Array.isArray(data) && dataLength > 0 ? data[0].series.length : 0

    const maximumFrequency = Math.max(...data.map(d => Math.max(...d.series.map(v => v.frequency))))

    const barHeight = dataSeriesLength < 3 ? 30 : 60 / (dataSeriesLength === 0 ? 1 : dataSeriesLength)
    const barMargin = 2
    const groupHeight = dataSeriesLength * barHeight /** bar chart group y axis height */
    const groupMargin = 20
    const fullWidth = (document.getElementById('horizontal-bar-chart-component')?.clientWidth ?? 0) - MARGIN.left
    const chartWidth = fullWidth - MARGIN.left - MARGIN.right
    const chartHeight = (dataLength * groupHeight) + (dataLength * barMargin) + (dataLength * groupMargin)
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
    // x axis scale configuration: d3 calculate the x number rely on maximum frequency (domain) and chart width (range)
    const xScale = d3.scaleLinear()
      .domain([0, maximumFrequency])
      .range([0, chartWidth])
      .nice()

    // x axis tick configuration: set tick to display only integer, hide tick, and add it padding
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d, _) => {
        return d.valueOf() % 1 !== 0 ? '' : d3.format('d')(d)
      })
      .tickSize(0)
      .tickPadding(5)

    // adding x scale to the svg by setting
    svg.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .transition()
      .call(xAxis)

    // y axis scale configuration: d3 calculate the y position rely on data label (domain) and chart height (range)
    const yScale = d3.scaleBand()
      .domain(d3.map(data, (d) => d.category))
      .range([0, chartHeight])

    // y axis tick configuration: hide tick and add it padding
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0)
      .tickPadding(5)

    // adding y scale to the svg by setting
    svg.append('g')
      .transition()
      .call(yAxis)

    // select all x and y matched `domain` class name and set scale stroke to be none (invisible)
    svg.selectAll('.domain')
      .style('stroke', 'none')

    // select all x and y matched `text` tag name and set text color and font size
    svg.selectAll('text')
      .style('color', 'white')
      .style('font-size', '14px')

    // select all x and y matched `line` tag name and set scale line color to be none (invisible)
    svg.selectAll('line')
      .style('color', 'none')

    // =================== Generate bar group =================
    // select all match `category` class in `g` tag and binding data
    svg.selectAll('g.category')
      .data(data)
      .enter()
      .append('g')
      .classed('category', true)
      .attr('transform', (d, i) => {
        // center the group bar chart to label
        const y = (yScale(d.category) ?? 0) + 8
        return `translate(0,${y})`
      })
      // adding bar chart by looping item in `data`
      .each(function (d) {
        const category = d3.select(this)
        const seriesLength = d.series.length
        for (let idx = 0; idx < seriesLength; idx++) {
          const frequencyValue = d.series[idx].frequency
          const x = xScale(frequencyValue)
          const width = x === 0 ? 2 : x - xScale(0)
          const y = ((seriesLength - 1) - idx) * (barHeight + barMargin)
          // adding bar chart into each bar chart in bar group
          category.append('rect')
            .attr('x', xScale(0))
            .attr('y', y)
            .attr('width', width)
            .attr('height', barHeight)
            .style('fill', d.series[idx].color ?? '')

          // adding text label into each bar chart in bargroup
          const textSize = { width: 30, height: 10 }
          const xPosition = width + 4
          category.append('text')
            .text(frequencyValue)
            .attr('fill', 'white')
            .attr('width', textSize.width)
            .attr('height', textSize.height)
            // In case the number is too less
            .attr('x', xPosition)
            .attr('y', y + (barHeight / 2) + 5)
        }
      })
  }
}
