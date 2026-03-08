"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const growthData = [
  { year: 2003, projects: 5, activeProjects: 3, resources: 8, vendors: 3 },
  { year: 2006, projects: 12, activeProjects: 5, resources: 15, vendors: 4 },
  { year: 2009, projects: 25, activeProjects: 10, resources: 25, vendors: 5 },
  { year: 2012, projects: 45, activeProjects: 15, resources: 40, vendors: 6 },
  { year: 2015, projects: 80, activeProjects: 25, resources: 55, vendors: 10 },
  { year: 2018, projects: 120, activeProjects: 35, resources: 75, vendors: 15 },
  { year: 2021, projects: 160, activeProjects: 40, resources: 90, vendors: 20 },
  { year: 2024, projects: 200, activeProjects: 45, resources: 100, vendors: 25 },
  { year: 2025, projects: 220, activeProjects: 50, resources: 110, vendors: 28 },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null

  return (
    <div className="rounded-xl border border-white/20 bg-black/90 p-4 backdrop-blur-sm">
      <p className="mb-2 text-sm font-medium text-white">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/60">{entry.name}:</span>
            <span className="text-white">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CompanyGrowthChart() {
  return (
    <div className="rounded-2xl border border-white/20 bg-[rgba(231,236,235,0.08)] p-6 backdrop-blur">
      <h3 className="mb-6 text-lg font-light text-white">
        Pertumbuhan Perusahaan <span className="text-white/60">(2003-2025)</span>
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={growthData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorResources" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="projects"
              name="Total Proyek"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#colorProjects)"
              dot={false}
              activeDot={{ r: 4, fill: "#06b6d4" }}
            />
            <Area
              type="monotone"
              dataKey="activeProjects"
              name="Proyek Aktif"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorActive)"
              dot={false}
              activeDot={{ r: 4, fill: "#8b5cf6" }}
            />
            <Area
              type="monotone"
              dataKey="resources"
              name="Tenaga Ahli"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorResources)"
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
            <Area
              type="monotone"
              dataKey="vendors"
              name="Total Vendor"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#colorVendors)"
              dot={false}
              activeDot={{ r: 4, fill: "#f59e0b" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
