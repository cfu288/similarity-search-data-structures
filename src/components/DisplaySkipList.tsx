import { SkipList } from "../lib/skip-list";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const INITIAL_SVG_SIZE = 500;
const MIN_SVG_SIZE = 100;
const MAX_SVG_SIZE = 500;
const SVG_WIDTH_FACTOR = 0.8;
const SKIP_LIST_HEIGHT = 8;
const RECT_WIDTH = 40;
const RECT_HEIGHT = 50;
const RECT_PADDING = 10; // Added padding between rectangles
const TEXT_X_POSITION = 20;
const TEXT_Y_OFFSET = 25;
const TEXT_Y_EXTRA_OFFSET = 13;

const defaultSl = new SkipList<number>(SKIP_LIST_HEIGHT, 0.6);
defaultSl.insert(1);
defaultSl.insert(2);
defaultSl.insert(3);
defaultSl.insert(4);
defaultSl.insert(5);
defaultSl.insert(6);
defaultSl.insert(7);

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

export function DisplaySkipList({
  skipList = defaultSl,
}: {
  skipList: SkipList<number>;
}) {
  const svgParentRef = useRef<HTMLDivElement>(null);
  const svgSize = useSVGSize(svgParentRef);
  const [sl, setSl] = useState(skipList);

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
              key={`gn${index}`}
              transform={`translate(${index * (RECT_WIDTH + RECT_PADDING) + TEXT_X_POSITION}, ${svgSize - node.next.length * RECT_HEIGHT - TEXT_Y_OFFSET} )`}
            >
              {[...node.next].reverse().map((n, i) => (
                <Fragment key={`gn${index}${i}`}>
                  {(index !== 0 || n) && (
                    <g>
                      <rect
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
                      <defs>
                        <marker
                          id="head"
                          orient="auto"
                          markerWidth="3"
                          markerHeight="4"
                          refX="0.1"
                          refY="2"
                        >
                          <path d="M0,0 V4 L2,2 Z" fill="black" />
                        </marker>
                      </defs>
                      <line
                        x1={TEXT_X_POSITION + 20}
                        y1={i * RECT_HEIGHT + TEXT_Y_OFFSET}
                        x2={
                          n && n.value !== null
                            ? TEXT_X_POSITION +
                              (sl.indexOf(n.value) - index) *
                                (RECT_WIDTH + RECT_PADDING) +
                              RECT_WIDTH / 1.5
                            : TEXT_X_POSITION +
                              (sl.size() - index + 1) *
                                (RECT_WIDTH + RECT_PADDING) -
                              25
                        }
                        y2={i * RECT_HEIGHT + TEXT_Y_OFFSET}
                        stroke="black"
                        strokeWidth={`2`}
                        markerEnd="url(#head)"
                      />
                    </g>
                  )}
                </Fragment>
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
          {/* tail */}
          <g
            key={`gn-tail`}
            transform={`translate(${(sl.size() + 1) * (RECT_WIDTH + RECT_PADDING) + TEXT_X_POSITION}, ${svgSize - sl.getHeaderNode().next.length * RECT_HEIGHT - TEXT_Y_OFFSET} )`}
          >
            {[...sl.getHeaderNode().next].reverse().map((n, i) => (
              <>
                {n && (
                  <g key={i}>
                    <rect
                      key={`n${i}-Tail`}
                      width={RECT_WIDTH}
                      height={RECT_HEIGHT}
                      y={i * RECT_HEIGHT}
                      fill="transparent"
                      stroke="black"
                    ></rect>
                    <text
                      x={TEXT_X_POSITION}
                      y={
                        sl.getHeaderNode().next.length * RECT_HEIGHT +
                        TEXT_Y_EXTRA_OFFSET
                      }
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {"TAIL"}
                    </text>
                  </g>
                )}
              </>
            ))}
          </g>
        </svg>
      </div>
      {/* generate new sl */}
      <button
        onClick={() => {
          const newSl = new SkipList<number>(SKIP_LIST_HEIGHT, 0.6);
          for (let i = 1; i < 7; i++) {
            newSl.insert(i);
          }
          setSl(newSl);
        }}
        className="mx-auto mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generate new Skip List
      </button>
    </div>
  );
}
