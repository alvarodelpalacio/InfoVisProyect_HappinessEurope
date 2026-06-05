function KeyInsights({ data, selectedFactor }) {
    const HAPPINESS = "Life evaluation (3-year average)"
  
    const calculateCorrelation = (xValues, yValues) => {
      const n = xValues.length
      if (n === 0) return null
  
      const xMean = xValues.reduce((a, b) => a + b, 0) / n
      const yMean = yValues.reduce((a, b) => a + b, 0) / n
  
      let numerator = 0
      let xDenominator = 0
      let yDenominator = 0
  
      for (let i = 0; i < n; i++) {
        const xDiff = xValues[i] - xMean
        const yDiff = yValues[i] - yMean
  
        numerator += xDiff * yDiff
        xDenominator += xDiff * xDiff
        yDenominator += yDiff * yDiff
      }
  
      const denominator = Math.sqrt(xDenominator * yDenominator)
  
      if (denominator === 0) return null
  
      return numerator / denominator
    }
  
    const validData = data.filter(
      d =>
        d[selectedFactor.key] !== undefined &&
        d[HAPPINESS] !== undefined &&
        !Number.isNaN(d[selectedFactor.key]) &&
        !Number.isNaN(d[HAPPINESS])
    )
  
    const correlation = calculateCorrelation(
      validData.map(d => d[selectedFactor.key]),
      validData.map(d => d[HAPPINESS])
    )
  
    const happiestCountry = validData
      .slice()
      .sort((a, b) => b[HAPPINESS] - a[HAPPINESS])[0]
  
    const highestFactorCountry = validData
      .slice()
      .sort((a, b) => b[selectedFactor.key] - a[selectedFactor.key])[0]
  
    const lowestFactorCountry = validData
      .slice()
      .sort((a, b) => a[selectedFactor.key] - b[selectedFactor.key])[0]
  
    return (
      <div className="key-insights-card">
        <h2>Key Insights</h2>
  
        <div className="insight-item">
          <span>Correlation with happiness</span>
          <strong>
            {correlation !== null ? correlation.toFixed(2) : "N/A"}
          </strong>
        </div>
  
        <div className="insight-item">
          <span>Happiest country</span>
          <strong>
            {happiestCountry?.COUNTRY} ·{" "}
            {happiestCountry?.[HAPPINESS]?.toFixed(2)}
          </strong>
        </div>
  
        <div className="insight-item">
          <span>Highest {selectedFactor.label}</span>
          <strong>
            {highestFactorCountry?.COUNTRY} ·{" "}
            {highestFactorCountry?.[selectedFactor.key]?.toFixed(2)}
          </strong>
        </div>
  
        <div className="insight-item">
          <span>Lowest {selectedFactor.label}</span>
          <strong>
            {lowestFactorCountry?.COUNTRY} ·{" "}
            {lowestFactorCountry?.[selectedFactor.key]?.toFixed(2)}
          </strong>
        </div>
      </div>
    )
  }
  
  export default KeyInsights