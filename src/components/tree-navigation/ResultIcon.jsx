import React from "react";

export default function ResultIcon({ width = 5, height = 5, isHighlighted }) {
    const [oldWidth, oldHeight] = [384, 512]; // Original size of the SVG path
    width = oldWidth * (height / oldHeight);

    return <path
        transform={`translate(-${width / 2}, -${height / 2})scale(${height / oldHeight}, ${height / oldHeight})  `}
        fill={isHighlighted ? "lightblue" : "white"}
        stroke={isHighlighted ? "none" : "#999"}
        strokeWidth={22}
        d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"
    />

}