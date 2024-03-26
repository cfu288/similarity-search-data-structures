import { SkipList } from "../lib/skip-list";
import React, { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_SVG_SIZE = 500;
const MIN_SVG_SIZE = 100;
const MAX_SVG_SIZE = 500;
const SVG_WIDTH_FACTOR = 0.8;
const SKIP_LIST_HEIGHT = 5;
const RECT_WIDTH = 40;
const RECT_HEIGHT = 50;
const RECT_PADDING = 10; // Added padding between rectangles
const TEXT_X_POSITION = 20;
const TEXT_Y_OFFSET = 25;
const TEXT_Y_EXTRA_OFFSET = 13;

const useSVGSize = (svgParentRef: React.RefObject<HTMLDivElement>) => {
  const [svgSize, setSvgSize] = useState(INITIAL_SVG_SIZE);

  const getSvgParentWidth = useCallback(() => {
    return svgParentRef.current
      ? Math.round(svgParentRef.current.offsetWidth * SVG_WIDTH_FACTOR)
      : 0;
  }, [svgParentRef]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (svgParentRef.current) {
        setSvgSize(
          Math.min(Math.max(getSvgParentWidth(), MIN_SVG_SIZE), MAX_SVG_SIZE)
        );
      }
    }
  }, [getSvgParentWidth, svgParentRef]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (typeof window !== "undefined") {
        setSvgSize(
          Math.min(Math.max(getSvgParentWidth(), MIN_SVG_SIZE), MAX_SVG_SIZE)
        );
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowResize);

      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [getSvgParentWidth]);

  return svgSize;
};

const sl = new SkipList<number>(10);
sl.insert(1);
sl.insert(5);
sl.insert(3);
sl.insert(6);
sl.insert(2);
sl.insert(4);
console.log(sl.toPrettyString());

export function DisplaySkipList() {
  const svgParentRef = useRef<HTMLDivElement>(null);
  const svgSize = useSVGSize(svgParentRef);

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 flex flex-col pb-8 w-full">
      <div
        className="flex flex-col justify-center align-middle transform"
        ref={svgParentRef}
      >
        <svg
          width={svgSize}
          height={svgSize}
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto border-2 border-black"
          style={{ width: svgSize, height: svgSize }}
        >
          {[sl.getHeaderNode(), ...sl.nodes()].map((node, index) => (
            <g
              key={index}
              transform={`translate(${index * (RECT_WIDTH + RECT_PADDING) + TEXT_X_POSITION}, ${svgSize - node.next.length * RECT_HEIGHT - TEXT_Y_OFFSET} )`}
            >
              {[...node.next].reverse().map((n, i) => (
                <>
                  {(index !== 0 || n) && (
                    <g key={i}>
                      <rect
                        key={i}
                        width={RECT_WIDTH}
                        height={RECT_HEIGHT}
                        y={i * RECT_HEIGHT}
                        fill="transparent"
                        stroke="black"
                      ></rect>
                      <text
                        x={TEXT_X_POSITION}
                        y={i * RECT_HEIGHT + TEXT_Y_OFFSET}
                        textAnchor="middle"
                      >
                        {`${n?.value || "END"}`}
                      </text>
                    </g>
                  )}
                </>
              ))}
              <text
                x={TEXT_X_POSITION}
                y={node.next.length * RECT_HEIGHT + TEXT_Y_EXTRA_OFFSET}
                textAnchor="middle"
                fontWeight="bold"
              >
                {index === 0 ? "HEAD" : node.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
