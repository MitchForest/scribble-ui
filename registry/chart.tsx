/**
 * ScribbleChart - Hand-drawn chart components
 *
 * Wraps Recharts v3 with Rough.js for sketchy bar/line fills.
 *
 * Features:
 * - Bar chart with Rough.js sketchy bars
 * - Line chart with hand-drawn line path
 * - Area chart with hachure fill
 * - Tooltips with sketchy border
 * - Legend with doodle markers
 * - Axis labels in handwriting font
 */

import * as React from "react"
import { useCallback, useId, useLayoutEffect, useMemo, useRef } from "react"
import * as RechartsPrimitive from "recharts"
import rough from "roughjs"
import { cn } from "./lib/utils"

// =============================================================================
// CHART CONFIG
// =============================================================================

const THEMES = { light: "", dark: ".dark" } as const

export type ScribbleChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ScribbleChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useScribbleChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useScribbleChart must be used within a <ScribbleChartContainer />")
  }
  return context
}

// =============================================================================
// CHART CONTAINER
// =============================================================================

interface ScribbleChartContainerProps extends React.ComponentProps<"div"> {
  config: ScribbleChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}

function ScribbleChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ScribbleChartContainerProps) {
  const uniqueId = useId()
  const chartId = `scribble-chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="scribble-chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-gray-600 dark:[&_.recharts-cartesian-axis-tick_text]:fill-gray-400",
          "[&_.recharts-cartesian-grid_line]:stroke-gray-200 dark:[&_.recharts-cartesian-grid_line]:stroke-gray-700",
          "[&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className
        )}
        style={{
          fontFamily: "var(--font-handwriting-body)",
        }}
        {...props}
      >
        <ScribbleChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// =============================================================================
// CHART STYLE (CSS Variables for colors)
// =============================================================================

function ScribbleChartStyle({
  id,
  config,
}: {
  id: string
  config: ScribbleChartConfig
}) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color
  )

  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

// =============================================================================
// SKETCHY BAR SHAPE
// =============================================================================

interface ScribbleBarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  radius?: number
  seed?: number
}

function ScribbleBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "var(--scribble-fill-primary, #fef3c7)",
  stroke = "var(--scribble-stroke, #1a1a1a)",
  seed = 42,
}: ScribbleBarShapeProps) {
  const svgRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const g = svgRef.current
    if (!g || width <= 0 || height <= 0) return

    // Clear previous
    while (g.firstChild) g.removeChild(g.firstChild)

    // Create temporary SVG for rough.js
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    const rc = rough.svg(tempSvg)

    const bar = rc.rectangle(0, 0, width, Math.abs(height), {
      roughness: 1.2,
      stroke: stroke,
      strokeWidth: 1.5,
      fill: fill,
      fillStyle: "hachure",
      hachureAngle: -41,
      hachureGap: 4,
      seed: seed,
    })

    // Append bar to the group
    g.appendChild(bar)
  }, [width, height, fill, stroke, seed])

  if (width <= 0 || height <= 0) return null

  return (
    <g ref={svgRef} transform={`translate(${x}, ${y})`} />
  )
}

// =============================================================================
// SKETCHY BAR (Wrapper for BarChart)
// =============================================================================

interface ScribbleBarProps extends Omit<RechartsPrimitive.BarProps, "shape" | "ref"> {
  /** Custom seed for consistent randomness */
  seed?: number
}

function ScribbleBar({ seed = 42, ...props }: ScribbleBarProps) {
  const shape = useCallback(
    (shapeProps: unknown) => {
      const p = shapeProps as ScribbleBarShapeProps
      return (
        <ScribbleBarShape
          {...p}
          seed={seed + (p.x || 0)}
        />
      )
    },
    [seed]
  )

   
  const BarComponent = RechartsPrimitive.Bar as any
  return <BarComponent shape={shape} {...props} />
}

// =============================================================================
// RE-EXPORTS FROM RECHARTS
// =============================================================================

const ScribbleBarChart = RechartsPrimitive.BarChart
const ScribbleLineChart = RechartsPrimitive.LineChart
const ScribbleAreaChart = RechartsPrimitive.AreaChart
const ScribblePieChart = RechartsPrimitive.PieChart
const ScribbleXAxis = RechartsPrimitive.XAxis
const ScribbleYAxis = RechartsPrimitive.YAxis
const ScribbleCartesianGrid = RechartsPrimitive.CartesianGrid
const ScribbleLine = RechartsPrimitive.Line
const ScribbleArea = RechartsPrimitive.Area
const ScribblePie = RechartsPrimitive.Pie
const ScribbleCell = RechartsPrimitive.Cell
const ScribbleReferenceLine = RechartsPrimitive.ReferenceLine
const ScribbleReferenceArea = RechartsPrimitive.ReferenceArea

// =============================================================================
// SCRIBBLE TOOLTIP
// =============================================================================

const ScribbleChartTooltip = RechartsPrimitive.Tooltip

interface ScribbleChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    value?: unknown
    name?: string
    dataKey?: string | number
    type?: string
    color?: string
    payload?: Record<string, unknown>
    fill?: string
  }>
  label?: unknown
  labelFormatter?: (value: string, payload: Array<unknown>) => React.ReactNode
  formatter?: (value: unknown, name: string, item: unknown, index: number, payload: unknown) => React.ReactNode
  className?: string
  labelClassName?: string
  color?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

function ScribbleChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ScribbleChartTooltipContentProps) {
  const { config } = useScribbleChart()
  const svgRef = useRef<SVGSVGElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Draw sketchy border
  useLayoutEffect(() => {
    const content = contentRef.current
    const svg = svgRef.current
    if (!content || !svg || !active) return

    const timer = setTimeout(() => {
      const width = content.offsetWidth
      const height = content.offsetHeight
      if (width === 0 || height === 0) return

      svg.setAttribute("width", String(width))
      svg.setAttribute("height", String(height))

      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const border = rc.rectangle(1, 1, width - 2, height - 2, {
        roughness: 0.8,
        stroke: "var(--scribble-stroke, #1a1a1a)",
        strokeWidth: 1.5,
        fill: "var(--scribble-bg, #fffef8)",
        fillStyle: "solid",
        seed: 42,
      })
      svg.appendChild(border)
    }, 10)

    return () => clearTimeout(timer)
  }, [active, payload])

  const tooltipLabel = useMemo(() => {
    if (hideLabel || !payload?.length) return null

    const [item] = payload
    const key = `${labelKey || item.dataKey || item.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const labelConfig = !labelKey && typeof label === "string" ? config[label] : undefined
    const value = labelConfig ? (labelConfig.label ?? label) : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value as string, payload)}
        </div>
      )
    }

    if (!value) return null

    return <div className={cn("font-medium", labelClassName)}>{value as React.ReactNode}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      ref={contentRef}
      className={cn(
        "relative z-50 min-w-[8rem] px-3 py-2 text-sm",
        "bg-[#fffef8] dark:bg-gray-900",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting-body)" }}
    >
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ overflow: "visible" }}
      />
      <div className="relative z-10 grid gap-1.5">
        {!nestLabel ? tooltipLabel : null}
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = (color || item.payload?.fill || item.color) as string | undefined

            return (
              <div
                key={`${item.dataKey}-${index}`}
                className={cn(
                  "flex w-full items-center gap-2",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {!hideIndicator && (
                      <div
                        className={cn("shrink-0 rounded-sm", {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1 h-4": indicator === "line",
                          "w-0 h-4 border-l-2 border-dashed": indicator === "dashed",
                        })}
                        style={{ backgroundColor: indicatorColor, borderColor: indicatorColor }}
                      />
                    )}
                    <div className="flex flex-1 justify-between items-center gap-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {(itemConfig?.label || item.name) as React.ReactNode}
                      </span>
                      {item.value !== undefined && (
                        <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                          {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

// =============================================================================
// SCRIBBLE LEGEND
// =============================================================================

const ScribbleChartLegend = RechartsPrimitive.Legend

interface ScribbleChartLegendContentProps extends React.ComponentProps<"div"> {
  payload?: RechartsPrimitive.LegendProps["payload"]
  verticalAlign?: "top" | "bottom"
  hideIcon?: boolean
  nameKey?: string
}

function ScribbleChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: ScribbleChartLegendContentProps) {
  const { config } = useScribbleChart()

  if (!payload?.length) return null

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting-body)" }}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={String(item.value)}
              className="flex items-center gap-1.5 text-sm"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-gray-600 dark:text-gray-400">
                {itemConfig?.label || item.value}
              </span>
            </div>
          )
        })}
    </div>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function getPayloadConfigFromPayload(
  config: ScribbleChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) return undefined

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ScribbleChartContainer,
  ScribbleChartStyle,
  ScribbleChartTooltip,
  ScribbleChartTooltipContent,
  ScribbleChartLegend,
  ScribbleChartLegendContent,
  ScribbleBarChart,
  ScribbleBar,
  ScribbleBarShape,
  ScribbleLineChart,
  ScribbleLine,
  ScribbleAreaChart,
  ScribbleArea,
  ScribblePieChart,
  ScribblePie,
  ScribbleCell,
  ScribbleXAxis,
  ScribbleYAxis,
  ScribbleCartesianGrid,
  ScribbleReferenceLine,
  ScribbleReferenceArea,
  useScribbleChart,
}
