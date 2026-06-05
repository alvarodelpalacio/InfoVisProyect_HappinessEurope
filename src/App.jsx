import { useEffect, useState } from "react"
import EuropeMap from "./EuropeMap"
import "./App.css"
import * as d3 from "d3"
import ScatterPlot from "./ScatterPlot"
import CountryPanel from "./CountryPanel"


const factors = [
  { label: "Purchasing Power", key: "local_pursch_power", description: "Shows how much people can afford with local incomes." },
  { label: "Freedom", key: "Explained by: Freedom to make life choices", description: "Contribution of freedom to make life choices to happiness." },
  { label: "Health", key: "Explained by: Healthy life expectancy", description: "Contribution of healthy life expectancy to happiness." },
  { label: "Social Support", key: "Explained by: Social support", description: "Contribution of social support to happiness." },
  { label: "Generosity", key: "Explained by: Generosity", description: "Contribution of generosity to happiness." },
  { label: "Corruption", key: "Explained by: Perceptions of corruption", description: "Contribution related to perceptions of corruption and trust." }
]

function App() {
  const [data, setData] = useState([])
  const [selectedFactor, setSelectedFactor] = useState(factors[0])
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    fetch("/InfoVisProyect_DataSet.json")
      .then(res => res.json())
      .then(json => {
        json.forEach(d => {
          Object.keys(d).forEach(key => {
            if (key !== "COUNTRY") {
              d[key] = Number(String(d[key]).replace(",", "."))
            }
          })
        })
        setData(json)
      })
  }, [])

  const getFactorColor = (factor, value) => {
    if (!data.length || value === undefined || Number.isNaN(value)) return "#b8c2b2"
  
    const values = data
      .map(d => d[factor.key])
      .filter(v => v !== undefined && !Number.isNaN(v))
  
    const min = Math.min(...values)
    const max = Math.max(...values)
  
    const t = (value - min) / (max - min)
  
    const low = [231, 154, 118]
    const high = [105, 184, 156]
  
    const r = Math.round(low[0] + t * (high[0] - low[0]))
    const g = Math.round(low[1] + t * (high[1] - low[1]))
    const b = Math.round(low[2] + t * (high[2] - low[2]))
  
    return `rgb(${r}, ${g}, ${b})`
  }


  return (
    <main className="app">
      <section className="hero">
        <div>
          <h1>What Shapes Happiness in Europe?</h1>
          <p className="subtitle">
            Exploring how economic and social factors relate to well-being across European countries.
          </p>
        </div>
      </section>

      <section className="factor-section">
        <div className="factor-header">
          <h2>Explore contributing factor</h2>
          <p>{selectedFactor.description}</p>
        </div>

        <div className="factor-buttons">
          {factors.map(factor => (
            <button
              key={factor.key}
              onClick={() => setSelectedFactor(factor)}
              className={selectedFactor.key === factor.key ? "active" : ""}
            >
              {factor.label}
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
      <div className="left-column">
            <div className="map-card">
              <div className="card-header">
                <div className="legend-note">
                  Low <span className="gradient-bar"></span> High
                </div>
              </div>

              <EuropeMap
                data={data}
                selectedFactor={selectedFactor}
                selectedCountry={selectedCountry}
                onSelectCountry={setSelectedCountry}
              />
            </div>

            <ScatterPlot
              data={data}
              selectedFactor={selectedFactor}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </div>

          <CountryPanel
          data={data}
          factors={factors}
          selectedCountry={selectedCountry}
          selectedFactor={selectedFactor}
          getFactorColor={getFactorColor}
        />

        
      </section>
    </main>
  )
}

export default App