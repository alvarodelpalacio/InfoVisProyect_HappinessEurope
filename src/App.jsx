import { useEffect, useState } from "react"
import EuropeMap from "./EuropeMap"
import "./App.css"
import * as d3 from "d3"

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

  const happiness = selectedCountry?.["Life evaluation (3-year average)"]

  const mainDriver = selectedCountry
    ? factors
        .filter(f => f.key !== "local_pursch_power")
        .sort((a, b) => selectedCountry[b.key] - selectedCountry[a.key])[0]
    : null

  const mostSimilarCountry = selectedCountry && data.length
    ? data
        .filter(d => d.COUNTRY !== selectedCountry.COUNTRY)
        .map(d => {
          const distance = factors.reduce((sum, f) => {
            return sum + Math.abs((d[f.key] ?? 0) - (selectedCountry[f.key] ?? 0))
          }, 0)
          return { country: d.COUNTRY, distance }
        })
        .sort((a, b) => a.distance - b.distance)[0]?.country
    : null

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

        <aside className="side-panel">
          <h2>Country Details</h2>

          {!selectedCountry ? (
            <p className="muted">Click a country on the map to see details.</p>
          ) : (
            <>
              <div className="country-header">
                <div className="face-icon">
                  {happiness >= 7 ? "😊" : happiness >= 6 ? "🙂" : happiness >= 5 ? "😐" : "☹️"}
                </div>

                <div>
                  <h3>{selectedCountry.COUNTRY}</h3>
                  <div className="score">{happiness.toFixed(2)}</div>
                  <div className="score-label">Happiness score</div>
                </div>
              </div>

              <div className="divider"></div>

              <h3 className="section-title">Contributing factors</h3>

              <div className="factor-list">
                {factors.map(factor => {
                  const value = selectedCountry[factor.key]
                  const max = Math.max(...data.map(d => d[factor.key] || 0))
                  const percentage = max ? (value / max) * 100 : 0

                  const getFactorColor = (factor, value) => {
                    if (!data.length || value === undefined || Number.isNaN(value)) return "#b8c2b2"
                  
                    const extent = d3.extent(data, d => d[factor.key])
                    const colorScale = d3.scaleLinear()
                      .domain(extent)
                      .range(["#e79a76", "#69b89c"])
                  
                    return colorScale(value)
                  }

                  return (
                    <div className="factor-row" key={factor.key}>
                      <div className="factor-label">
                        <span>{factor.label}</span>
                        <span>{value?.toFixed(2)}</span>
                      </div>
                      <div className="bar-bg">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percentage}%`,
                            background: getFactorColor(factor, value)
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="divider"></div>

              <div className="detail-block">
                <span>Main happiness driver</span>
                <strong>{mainDriver?.label}</strong>
              </div>

              <div className="detail-block">
                <span>Most similar country</span>
                <strong>{mostSimilarCountry}</strong>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  )
}

export default App