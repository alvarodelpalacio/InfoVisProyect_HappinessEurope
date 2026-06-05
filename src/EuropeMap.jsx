import { useEffect, useRef } from "react"
import * as d3 from "d3"

function EuropeMap({ data, selectedFactor, selectedCountry, onSelectCountry }) {
  const svgRef = useRef()

  useEffect(() => {
    if (!data.length) return

    d3.json("/europe.geojson").then((geoData) => {
      const svg = d3.select(svgRef.current)
      svg.selectAll("*").remove()

      const width = 800
      const height = 1000

      svg.attr("width", width).attr("height", height)

      const projection = d3.geoMercator()
        .center([8, 55])
        .scale(650)
        .translate([width / 2, height / 2 - 60])

      const pathGenerator = d3.geoPath().projection(projection)

      const countryNameMap = {
        "Bosnia and Herzegovina": "Bosnia And Herzegovina",
        "The former Yugoslav Republic of Macedonia": "North Macedonia"
      }

      const dataByCountry = new Map(data.map(d => [d.COUNTRY, d]))

      const colorScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[selectedFactor.key]))
        .range(["#e79a76", "#69b89c"])

      svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("fill", feature => {
          const countryName = feature.properties.NAME
          const mappedName = countryNameMap[countryName] || countryName
          const countryData = dataByCountry.get(mappedName)

          if (!countryData) return "#eeeeee"

          return colorScale(countryData[selectedFactor.key])
        })
        .attr("stroke", feature => {
          const countryName = feature.properties.NAME
          const mappedName = countryNameMap[countryName] || countryName
          return selectedCountry?.COUNTRY === mappedName ? "#18332f" : "#ffffff"
        })
        .attr("stroke-width", feature => {
          const countryName = feature.properties.NAME
          const mappedName = countryNameMap[countryName] || countryName
          return selectedCountry?.COUNTRY === mappedName ? 1.5 : 0.7
        })
        .style("cursor", feature => {
          const countryName = feature.properties.NAME
          const mappedName = countryNameMap[countryName] || countryName
          return dataByCountry.get(mappedName) ? "pointer" : "default"
        })
        .each(function(feature) {
            const countryName = feature.properties.NAME
            const mappedName = countryNameMap[countryName] || countryName
          
            if (selectedCountry?.COUNTRY === mappedName) {
              this.parentNode.appendChild(this)
            }
          })
        .on("click", (event, feature) => {
          const countryName = feature.properties.NAME
          const mappedName = countryNameMap[countryName] || countryName
          const countryData = dataByCountry.get(mappedName)

          if (countryData) onSelectCountry(countryData)
        })
    })
  }, [data, selectedFactor, selectedCountry, onSelectCountry])

  return <svg ref={svgRef}></svg>
}

export default EuropeMap