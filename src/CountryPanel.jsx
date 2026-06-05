function CountryPanel({
    data,
    factors,
    selectedCountry,
    selectedFactor,
    getFactorColor
  }) {
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
            
            <div className="divider"></div>

            
               
          </>
        )}
      </aside>
    )
  }
  
  export default CountryPanel

