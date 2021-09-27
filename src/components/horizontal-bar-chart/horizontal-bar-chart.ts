import * as d3 from 'd3'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'

const MARGIN = { top: 20, right: 20, bottom: 30, left: 80 }

export default class HorizontalBarChartComponent extends Vue {
  @Prop({ default: [] })
  public chartData!: ChartModels.BarChartItem[]

  public get hasData (): boolean {
    return this.chartData.length > 0
  }

  public mounted (): void {
    // this.generateGroupedChart()
  }

  @Watch('chartData', { deep: true })
  onChartDataChange (): void {
    this.generateGroupedChart()
  }

  public generateChart (): void {
    const data = this.chartData.sort((a, b) => a.category.localeCompare(b.category))
    const maximumFrequency = Math.max(...data.map(datum => datum.frequency))

    const barHeight = 40
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
      .domain([0, maximumFrequency])
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
      .domain(d3.map(data, (d) => d.category))
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
      .attr('y', (d) => yScale(d.category) ?? 0)
      .attr('width', (d) => xScale(d.frequency))
      .attr('height', yScale.bandwidth())
      .attr('fill', '#31984F')

    // frequency label group
    const textSize = { width: 50, height: 10 }
    svg.append('g')
      .selectAll('myRect')
      .data(data)
      .enter()
      .append('text')
      .text((d) => d.frequency)
      .attr('fill', 'white')
      .attr('width', textSize.width)
      .attr('height', textSize.height)
      .attr('x', (d) => xScale(d.frequency) - textSize.width / 2)
      .attr('y', (d) => (yScale(d.category) ?? 0) + yScale.bandwidth() / 2 + textSize.height / 2)
  }

  public generateGroupedChart (): void {
    const data = [
      {
        category: 'Birds',
        values: [
          { location: 'sites group 1', value: 200 },
          { location: 'sites group 2', value: 100 },
          { location: 'sites group 2', value: 100 },
          { location: 'sites group 3', value: 50 }
        ]
      },
      {
        category: 'Amphebians',
        values: [
          { location: 'sites group 1', value: 150 },
          { location: 'sites group 2', value: 300 },
          { location: 'sites group 2', value: 100 },
          { location: 'sites group 3', value: 50 }
        ]
      },
      {
        category: 'Mammals',
        values: [
          { location: 'sites group 1', value: 100 },
          { location: 'sites group 2', value: 200 },
          { location: 'sites group 2', value: 100 },
          { location: 'sites group 3', value: 450 }
        ]
      },
      {
        category: 'Other',
        values: [
          { location: 'sites group 1', value: 100 },
          { location: 'sites group 2', value: 200 },
          { location: 'sites group 2', value: 100 },
          { location: 'sites group 3', value: 450 }
        ]
      }
    ]

    const maximumFrequency = Math.max(...data.map(d => Math.max(...d.values.map(v => v.value))))

    const colors = ['brown', 'red', 'orange']
    const barHeight = 30
    const barMargin = 0
    const groupHeight = Array.isArray(data) && data.length > 0 ? data[0].values.length * barHeight : 0 /** bar chart group y axis height */
    const groupMargin = 20
    const fullWidth = document.getElementById('horizontal-bar-chart-component')?.clientWidth ?? 0 - MARGIN.left
    const chartWidth = fullWidth - MARGIN.left - MARGIN.right
    const chartHeight = (data.length * groupHeight) + (data.length * barMargin)
    const fullHeight = chartHeight + MARGIN.top + MARGIN.bottom

    const chart: d3.Selection<SVGGElement, unknown, HTMLElement, unknown> = d3.select('#multi-bar-chart')
    chart.selectAll('*').remove()

    const svg = d3.select('#multi-bar-chart')
      .append('svg')
      .attr('width', fullWidth)
      .attr('height', fullHeight)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

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

    svg.selectAll('g.category')
      .data(data)
      .enter()
      .append('g')
      .classed('category', true)
      .attr('transform', d => {
        return `translate(0,${(yScale(d.category) ?? 0)})`
      })
      .each(function (d) {
        const category = d3.select(this)
        for (let idx = 0; idx < d.values.length; idx++) {
          const x = xScale(d.values[idx].value)
          const width = x - xScale(0)
          const y = (d.values.length / 2 - idx) * (barHeight + barMargin)
          category.append('rect')
            .attr('x', xScale(0))
            .attr('y', y)
            .attr('width', width)
            .attr('height', barHeight)
            .style('fill', colors[idx])
        }
      })
  }
}
