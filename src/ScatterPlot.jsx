import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList
  } from "recharts"
  
  const HAPPINESS = "Life evaluation (3-year average)"
  
  function ScatterPlot({ data, selectedFactor, selectedCountry, onSelectCountry }) {
    const chartData = data
      .filter(d =>
        d[selectedFactor.key] !== undefined &&
        d[HAPPINESS] !== undefined &&
        !Number.isNaN(d[selectedFactor.key]) &&
        !Number.isNaN(d[HAPPINESS])
      )
      .map(d => ({
        country: d.COUNTRY,
        x: d[selectedFactor.key],
        y: d[HAPPINESS],
        original: d,
        isSelected: selectedCountry?.COUNTRY === d.COUNTRY
      }))
  
    return (
      <div className="scatter-card">
        <div className="scatter-header">
          <div>
            <h2>Relationship Analysis</h2>
            <p>{selectedFactor.label} vs Happiness</p>
          </div>
        </div>
  
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 35, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4ded2" />
  
            <XAxis
              type="number"
              dataKey="x"
              name={selectedFactor.label}
              tick={{ fill: "#60706c", fontSize: 12 }}
              label={{
                value: selectedFactor.label,
                position: "insideBottom",
                offset: -20,
                fill: "#60706c"
              }}
            />
  
            <YAxis
              type="number"
              dataKey="y"
              name="Happiness"
              domain={[4, 8]}
              ticks={[4, 5, 6, 7, 8]}
              label={{
                value: "Happiness",
                angle: -90,
                position: "insideLeft",
                fill: "#60706c"
              }}
            />
  
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
  
                const point = payload[0].payload
  
                return (
                  <div className="tooltip-box">
                    <strong>{point.country}</strong>
                    <p>{selectedFactor.label}: {point.x.toFixed(2)}</p>
                    <p>Happiness: {point.y.toFixed(2)}</p>
                  </div>
                )
              }}
            />
  
            <Scatter
            data={chartData}
            onClick={(point) => onSelectCountry(point.original)}
            shape={(props) => {
                const { cx, cy, payload } = props

                return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={payload.isSelected ? 7 : 4}
                    fill={payload.isSelected ? "#e07a5f" : "#69b89c"}
                />
                )
            }}
            >
            <LabelList
                dataKey="country"
                content={({ x, y, value }) => {
                if (selectedCountry?.COUNTRY !== value) return null

                return (
                    <text
                    x={x + 10}
                    y={y - 10}
                    fontSize={12}
                    fill="#18332f"
                    fontWeight="700"
                    >
                    {value}
                    </text>
                )
                }}
            />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  export default ScatterPlot