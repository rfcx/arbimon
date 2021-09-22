import * as d3 from 'd3'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'

export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] })
  public chartData!: ChartModels.BarChartItem[]

  public margin = { top: 20, right: 20, bottom: 30, left: 80 }
  public FULL_WIDTH!: number
  public CHART_WIDTH!: number
  public FULL_HEIGHT = 300
  public CHART_HEIGHT = this.FULL_HEIGHT - this.margin.top - this.margin.bottom

  public mounted (): void {
    this.FULL_WIDTH = document.getElementById('horizontal-bar-chart-component')?.clientWidth ?? 0 - this.margin.left
    this.CHART_WIDTH = this.FULL_WIDTH - this.margin.left - this.margin.right
    this.generateChart()
  }

  public get hasData (): boolean {
    return this.chartData.length > 0
  }

  @Watch('chartData')
  onChartDataChange (): void {
    this.generateChart()
  }

  public generateChart (): void {
    const data = this.chartData

    let maximumPopulation = 0
    for (const species of data) {
      if (species.population > maximumPopulation) {
        maximumPopulation = species.population
      }
    }

    let svg: d3.Selection<SVGGElement, unknown, HTMLElement, unknown> = d3.select('#multi-bar-chart')
    svg.selectAll('*').remove()

    svg = svg
      .append('svg')
      .attr('width', this.FULL_WIDTH)
      .attr('height', this.FULL_HEIGHT)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, maximumPopulation])
      .range([0, this.CHART_WIDTH])

    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d, _) => {
        return d.valueOf() % 1 !== 0 ? '' : d3.format('d')(d)
      })
      .tickSize(0)
      .tickPadding(10)

    svg.append('g')
      .attr('transform', `translate(0,${this.CHART_HEIGHT})`)
      .transition()
      .call(xAxis)

    const yScale = d3.scaleBand()
      .domain(d3.map(this.chartData, (d) => d.label))
      .range([0, this.CHART_HEIGHT])
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

    // data render
    svg.selectAll('myRect')
      .data(data)
      .enter()
      .append('rect')
      .style('margin-top', '10px')
      .attr('x', xScale(0))
      // @ts-expect-error horizontal y scale label error
      .attr('y', (d) => yScale(d.label))
      .attr('width', (d) => xScale(d.population))
      .attr('height', yScale.bandwidth())
      .attr('fill', '#31984F')
  }
}
