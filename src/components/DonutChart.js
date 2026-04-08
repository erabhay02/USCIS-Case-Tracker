import React from "react";
import Svg, { Circle, Text as SvgText, G } from "react-native-svg";

/**
 * Stroke-based SVG donut chart.
 * Each segment is drawn by rotating a Circle with strokeDasharray.
 */
export default function DonutChart({ segments, total, size = 200, thickness = 38 }) {
    const r = (size - thickness) / 2;
    const circumference = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    let accumulated = 0;

    return (
        <Svg width={size} height={size}>
            {/* Track */}
            <Circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke="#e7e8e9"
                strokeWidth={thickness}
            />
            {segments.map((seg) => {
                if (!seg.count || seg.count === 0) return null;
                const dash = (seg.count / total) * circumference;
                // -90 deg offset so chart starts from 12 o'clock
                const startDeg = (accumulated / total) * 360 - 90;
                accumulated += seg.count;
                return (
                    <G key={seg.key} transform={`rotate(${startDeg}, ${cx}, ${cy})`}>
                        <Circle
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={thickness}
                            // 1.5px gap between segments
                            strokeDasharray={`${Math.max(0, dash - 1.5)} ${circumference}`}
                        />
                    </G>
                );
            })}
            {/* Center labels */}
            <SvgText
                x={cx} y={cy - 7}
                textAnchor="middle"
                fill="#191c1d"
                fontSize="28"
                fontWeight="bold"
            >
                {total}
            </SvgText>
            <SvgText
                x={cx} y={cy + 13}
                textAnchor="middle"
                fill="#6d7380"
                fontSize="11"
            >
                Total Cases
            </SvgText>
        </Svg>
    );
}
