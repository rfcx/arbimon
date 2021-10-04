import * as d3 from 'd3'
import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels, ProjectModels } from '@/models'
import { VuexService } from '@/services'
import { exportChartWithElement } from '@/utils'
import ExportButtonView from '@/views/export-button.vue'

const MARGIN = { top: 20, right: 20, bottom: 30, left: 80 }
const GROUP_MARGIN = 20
const BAR_MARGIN = 2

@Options({
  components: {
    ExportButtonView
  }
})
export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] })
  chartData!: ChartModels.GroupedBarChartItem[]

  @Prop({ default: 'chart' })
  chartId!: string

  @Prop({ default: '' })
  chartTitle!: string

  @VuexService.Project.selectedProject.bind()
  selectedProject!: ProjectModels.ProjectListItem | undefined

  get hasData (): boolean {
    return this.chartData.length > 0
  }

  mounted (): void {
    d3.select(window).on('resize', (e) => {
      this.renderChart()
    })
  }

  @Watch('chartData', { deep: true })
  onChartDataChange (): void {
    this.renderChart()
  }

  renderChart (): void {
    const id = this.chartId
    const screenWidth = (document.getElementById('horizontal-bar-chart-component')?.clientWidth ?? 0)
    const chart = this.generateChart(screenWidth, 'render')
    this.clearChart(id)
    document.getElementById(id)?.appendChild(chart)
  }

  generateChart (width: number, theme: ChartModels.ChartTheme): Element {
    const fontColor = theme === 'render' ? 'white' : 'black'
    const margin = theme === 'render' ? MARGIN : { top: 40, right: 40, bottom: 50, left: 100 }

    const data = this.chartData
    const dataLength = data.length
    const dataSeriesLength = dataLength > 0 ? data[0].series.length : 0

    const maximumFrequency = Math.max(...data.map(d => Math.max(...d.series.map(v => v.frequency))))
    const barHeight = dataSeriesLength < 3 ? 30 : 60 / (dataSeriesLength === 0 ? 1 : dataSeriesLength)
    const groupHeight = dataSeriesLength * barHeight /** bar chart group y axis height */
    const chartWidth = width - margin.left - margin.right
    const chartHeight = (dataLength * groupHeight) + (dataLength * BAR_MARGIN) + (dataLength * GROUP_MARGIN)
    const fullHeight = chartHeight + margin.top + margin.bottom

    const svgContainer = document.createElement('div')
    const chart = d3.select(svgContainer)

    const svg = chart
      .append('svg')
      .attr('width', width)
      .attr('height', fullHeight)
      // .attr('class', theme)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

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
      .domain(d3.map(data, (d) => d.group))
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
      .style('color', fontColor)
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
        const y = (yScale(d.group) ?? 0) + 8
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
          const y = ((seriesLength - 1) - idx) * (barHeight + BAR_MARGIN)
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
            .attr('fill', fontColor)
            .style('color', fontColor)
            .style('font-size', '14px')
            .attr('width', textSize.width)
            .attr('height', textSize.height)
            // In case the number is too less
            .attr('x', xPosition)
            .attr('y', y + (barHeight / 2) + 5)
        }
      })

    return chart.node() as Element
  }

  clearChart (id: string): void {
    d3.select(`#${id}`).selectAll('*').remove()
  }

  async downloadChart (): Promise<void> {
    let filename = `${this.chartId}-${new Date().getTime()}`
    if (this.selectedProject?.name) {
      filename = this.selectedProject.name.replace(' ', '-') + '-' + filename
    }

    const chart = this.generateChart(640, 'export')
    // TODO: 73 add legend if needed

    // wait for chart to render x & y label
    setTimeout(() => {
      // then export
      void exportChartWithElement(chart, filename)
    }, 180)
  }
}
