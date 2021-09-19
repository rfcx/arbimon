import * as d3 from 'd3'
import { Vue } from 'vue-class-component'

interface ChartItem {
  label: string
  population: number
}

export default class HorizontalBarChartComponent extends Vue {
  margin = { top: 20, right: 20, bottom: 20, left: 80 }
  FULL_WIDTH = 0
  CHART_WIDTH = 0
  FULL_HEIGHT = 300
  CHART_HEIGHT = this.FULL_HEIGHT - this.margin.top - this.margin.bottom

  chartData: ChartItem[] = [
    {
      label: 'birds',
      population: 1000
    },
    {
      label: 'mammal',
      population: 1500
    },
    {
      label: 'reptile',
      population: 800
    }
  ]

  groupLabels = d3.map(this.chartData, (d) => d.label)

  mounted (): void {
    this.FULL_WIDTH = document.getElementById('multi-bar-chart')?.clientWidth ?? 0 - this.margin.left
    this.CHART_WIDTH = this.FULL_WIDTH - this.margin.left - this.margin.right
    this.generateChart()
  }

  get hasData (): boolean {
    return this.chartData.length > 0
  }

  generateChart (): void {
    const data = this.chartData

    let maximumPopulation = 0
    for (const species of this.chartData) {
      if (species.population > maximumPopulation) {
        maximumPopulation = species.population
      }
    }

    const svg = d3.select('#multi-bar-chart')
      .append('svg')
      .attr('width', this.FULL_WIDTH)
      .attr('height', this.FULL_HEIGHT)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    const xAxis = d3.scaleLinear()
      .domain([0, maximumPopulation])
      .range([0, this.CHART_WIDTH])

    svg.append('g')
      .attr('transform', `translate(0,${this.CHART_HEIGHT})`)
      .call(d3.axisBottom(xAxis))

    const yAxis = d3.scaleBand()
      .domain(this.groupLabels)
      .range([0, this.CHART_HEIGHT])
      .paddingInner(0.2)

    svg.append('g')
      .call(d3.axisLeft(yAxis))

    // scale color line
    svg.selectAll('.domain')
      .style('stroke', 'white')

    svg.selectAll('text')
      .style('color', 'white')

    svg.selectAll('line')
      .style('color', 'white')

    // data render
    svg.selectAll('myRect')
      .data(data)
      .enter()
      .append('rect')
      .style('margin-top', '10px')
      .attr('x', xAxis(0))
      // @ts-expect-error
      .attr('y', (d) => yAxis(d.label))
      .attr('width', (d) => xAxis(d.population))
      .attr('height', yAxis.bandwidth())
      .attr('fill', '#31984F')
  }
}
