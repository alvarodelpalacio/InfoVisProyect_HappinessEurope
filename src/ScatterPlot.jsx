import { useState } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  BarChart,
  Bar
} from "recharts"

const HAPPINESS = "Life evaluation (3-year average)"

function ScatterPlot({ data, selectedFactor, selectedCountry, onSelectCountry }) {
  const [chartMode, setChartMode] = useState("relationship")

  const validData = data.filter(d =>
    d[selectedFactor.key] !== undefined &&
    d[HAPPINESS] !== undefined &&
    !Number.isNaN(d[selectedFactor.key]) &&
    !Number.isNaN(d[HAPPINESS])
  )

  const normalize = (value, values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    )

    return std === 0 ? 0 : (value - mean) / std
  }

  const factorValues = validData.map(d => d[selectedFactor.key])
  const happinessValues = validData.map(d => d[HAPPINESS])

  const chartData = validData.map(d => ({
    country: d.COUNTRY,
    x: d[selectedFactor.key],
    y: d[HAPPINESS],
    original: d,
    isSelected: selectedCountry?.COUNTRY === d.COUNTRY
  }))

  const rankingData = validData
    .slice()
    .sort((a, b) => b[selectedFactor.key] - a[selectedFactor.key])
    .slice(0, 10)
    .map(d => ({
      country: d.COUNTRY,
      value: d[selectedFactor.key],
      original: d,
      isSelected: selectedCountry?.COUNTRY === d.COUNTRY
    }))

  const deviationData = validData
    .map(d => {
      const factorNorm = normalize(d[selectedFactor.key], factorValues)
      const happinessNorm = normalize(d[HAPPINESS], happinessValues)

      return {
        country: d.COUNTRY,
        value: happinessNorm - factorNorm,
        original: d,
        isSelected: selectedCountry?.COUNTRY === d.COUNTRY
      }
    })
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 10)

  return (
    <div className="scatter-card">
      <div className="scatter-header">
        <div>
          <h2>
            {chartMode === "relationship"
              ? "Relationship Analysis"
              : chartMode === "ranking"
                ? "Top 10 Countries"
                : "Deviation Analysis"}
          </h2>
          <p>
            {chartMode === "relationship"
              ? `${selectedFactor.label} vs Happiness`
              : chartMode === "ranking"
                ? `Highest ${selectedFactor.label}`
                : `Countries that differ most from the ${selectedFactor.label} pattern`}
          </p>
        </div>

        <select
          className="chart-mode-select"
          value={chartMode}
          onChange={(event) => setChartMode(event.target.value)}
        >
          <option value="relationship">Relationship</option>
          <option value="ranking">Top 10</option>
          <option value="deviation">Deviation</option>
        </select>
      </div>

      <div className="analysis-chart-area">
        {chartMode === "relationship" ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 35, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ded2" />

              <XAxis
                type="number"
                dataKey="x"
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
                domain={[4, 8]}
                ticks={[4, 5, 6, 7, 8]}
                tick={{ fill: "#60706c", fontSize: 12 }}
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
        ) : chartMode === "ranking" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rankingData}
              layout="vertical"
              margin={{ top: 10, right: 55, bottom: 10, left: 85 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ded2" />

              <XAxis type="number" tick={{ fill: "#60706c", fontSize: 12 }} />

              <YAxis
                type="category"
                dataKey="country"
                width={100}
                tick={{ fill: "#18332f", fontSize: 12, fontWeight: 700 }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const point = payload[0].payload

                  return (
                    <div className="tooltip-box">
                      <strong>{point.country}</strong>
                      <p>{selectedFactor.label}: {point.value.toFixed(2)}</p>
                    </div>
                  )
                }}
              />

              <Bar
                dataKey="value"
                onClick={(point) => onSelectCountry(point.original)}
                shape={(props) => {
                  const { x, y, width, height, payload } = props

                  return (
                    <g>
                      <rect
                        x={x}
                        y={y + 3}
                        width={width}
                        height={height - 6}
                        rx={999}
                        fill={payload.isSelected ? "#e07a5f" : "#69b89c"}
                      />
                      <text
                        x={x + width + 8}
                        y={y + height / 2 + 4}
                        fontSize={12}
                        fill="#18332f"
                        fontWeight="700"
                      >
                        {payload.value.toFixed(2)}
                      </text>
                    </g>
                  )
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={deviationData}
              layout="vertical"
              margin={{ top: 10, right: 55, bottom: 10, left: 85 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ded2" />

              <XAxis
                type="number"
                tick={{ fill: "#60706c", fontSize: 12 }}
              />

              <YAxis
                type="category"
                dataKey="country"
                width={100}
                tick={{ fill: "#18332f", fontSize: 12, fontWeight: 700 }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const point = payload[0].payload

                  return (
                    <div className="tooltip-box">
                      <strong>{point.country}</strong>
                      <p>Deviation: {point.value.toFixed(2)}</p>
                      <p>
                        Positive = happier than expected compared with{" "}
                        {selectedFactor.label}
                      </p>
                      <p>
                        Negative = less happy than expected compared with{" "}
                        {selectedFactor.label}
                      </p>
                    </div>
                  )
                }}
              />

              <Bar
                dataKey="value"
                onClick={(point) => onSelectCountry(point.original)}
                shape={(props) => {
                  const { x, y, width, height, payload } = props
                  const isPositive = payload.value >= 0

                  return (
                    <g>
                      <rect
                        x={isPositive ? x : x + width}
                        y={y + 3}
                        width={Math.abs(width)}
                        height={height - 6}
                        rx={999}
                        fill={
                          payload.isSelected
                            ? "#e07a5f"
                            : isPositive
                              ? "#69b89c"
                              : "#d98c73"
                        }
                      />
                      <text
                        x={isPositive ? x + width + 8 : x + width - 45}
                        y={y + height / 2 + 4}
                        fontSize={12}
                        fill="#18332f"
                        fontWeight="700"
                      >
                        {payload.value.toFixed(2)}
                      </text>
                    </g>
                  )
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default ScatterPlot