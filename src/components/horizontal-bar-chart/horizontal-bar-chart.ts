import * as d3 from 'd3'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'

export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] })
  public chartData!: ChartModels.BarChartItem[]

  public margin = { top: 20, right: 20, bottom: 20, left: 80 }
  public FULL_WIDTH!: number
  public CHART_WIDTH!: number
  public FULL_HEIGHT = 300
  public CHART_HEIGHT = this.FULL_HEIGHT - this.margin.top - this.margin.bottom

  public mounted (): void {
    this.FULL_WIDTH = 1000 - this.margin.left
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
    for (const species of this.chartData) {
      if (species.population > maximumPopulation) {
        maximumPopulation = species.population
      }
    }

    let svg = d3.select('#multi-bar-chart').select('svg > g')

    console.log(svg.empty())

    if (svg.empty()) {
      svg = d3.select('#multi-bar-chart')
        .append('svg')
        .attr('width', this.FULL_WIDTH)
        .attr('height', this.FULL_HEIGHT)
        .append('g')
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
    } else {
      svg.selectAll('*').remove()
    }

    const xScale = d3.scaleLinear()
      .domain([0, maximumPopulation])
      .range([0, this.CHART_WIDTH])

    const xAxis = d3.axisBottom(xScale)
      .tickSize(0)
      .tickPadding(10)

    svg.append('g')
      .attr('transform', `translate(0,${this.CHART_HEIGHT})`)
      .transition()
      .call(xAxis)

    const yScale = d3.scaleBand()
      .domain(d3.map(this.chartData, (d) => d.label.toUpperCase()))
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

    svg.selectAll('line')
      .style('color', 'none')

    // data render
    svg.selectAll('myRect')
      .data(data)
      .join(
        (enter) => {
          return enter
            .append('rect')
            .style('margin-top', '10px')
            .attr('x', xScale(0))
            // @ts-expect-error horizontal y scale label error
            .attr('y', (d) => yScale(d.label.toUpperCase()))
            .attr('width', (d) => xScale(d.population))
            .attr('height', yScale.bandwidth())
            .attr('fill', '#31984F')
        },
        (update) => {
          return update
        },
        (exit) => {
          return exit
            .transition()
            .duration(1000)
            .remove()
        }
      )
      .transition()
  }
}
