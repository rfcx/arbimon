import * as d3 from 'd3'
import { Vue } from 'vue-class-component'

export default class HorizontalBarChartComponent extends Vue {
  margin = { top: 20, right: 20, bottom: 20, left: 80 }
  FULL_WIDTH = screen.width
  CHART_WIDTH = this.FULL_WIDTH - this.margin.left - this.margin.right
  FULL_HEIGHT = 300
  CHART_HEIGHT = this.FULL_HEIGHT - this.margin.top - this.margin.bottom

  chartData = [
    {
      species: 'birds',
      population: 1000
    },
    {
      species: 'mammal',
      population: 1500
    },
    {
      species: 'reptile',
      population: 500
    }
  ]

  mounted (): void {
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
      .attr('fill', 'white')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    const xAxis = d3.scaleLinear()
      .domain([0, maximumPopulation])
      .range([0, this.CHART_WIDTH])

    svg.append('g')
      .attr('transform', `translate(0,${this.CHART_HEIGHT})`)
      .call(d3.axisBottom(xAxis))
      .selectAll('text')
      .style('color', 'white')

    const yAxis = d3.scaleBand()
      .range([0, this.CHART_HEIGHT])
      .domain(data.map(d => d.species))

    svg.append('g')
      .call(d3.axisLeft(yAxis))
      .selectAll('text')
      .style('color', 'white')

    // svg.selectAll('myRect')
    //   .data(data)
    //   .enter()
    //   .append('rect')
    //   .attr('x', xAxis(0))
    //   .attr('y', (d) => d.species)
    //   .attr('width', (d) => d.population)
    //   .attr('height', yAxis.bandwidth())
    //   .attr('fill', '#69b3a2')
  }
}
