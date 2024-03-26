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
for (let i = 1; i < 8; i++) {
  defaultSl.insert(i);
}

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

  const searchGenerator = useRef(sl.getGenerator(5));
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);
  const [count, setCount] = useState(-1);

  const handleNext = () => {
    const result = searchGenerator.current.next();
    setCount(count + 1);
    if (!result.done) {
      setHighlightedNode(result.value);
    } else if (result.done && result.value) {
      setHighlightedNode(result.value as number);
    } else {
      //   setHighlightedNode(null);
    }
  };

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
                        fill={
                          node.value === 5 && highlightedNode === node.value
                            ? "yellow"
                            : highlightedNode === node.value
                              ? "green"
                              : "transparent"
                        }
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
                          id="head-black"
                          orient="auto"
                          markerWidth="3"
                          markerHeight="4"
                          refX="0.1"
                          refY="2"
                        >
                          <path d="M0,0 V4 L2,2 Z" fill={"black"} />
                        </marker>
                        <marker
                          id="head-red"
                          orient="auto"
                          markerWidth="3"
                          markerHeight="4"
                          refX="0.1"
                          refY="2"
                        >
                          <path d="M0,0 V4 L2,2 Z" fill={"red"} />
                        </marker>
                        <marker
                          id="head-green"
                          orient="auto"
                          markerWidth="3"
                          markerHeight="4"
                          refX="0.1"
                          refY="2"
                        >
                          <path d="M0,0 V4 L2,2 Z" fill={"green"} />
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
                        strokeWidth={`2`}
                        markerEnd={
                          highlightedNode === node.value && node.value !== 5
                            ? 5 < (n?.value || Number.MAX_SAFE_INTEGER)
                              ? "url(#head-red)"
                              : "url(#head-green)"
                            : "url(#head-black)"
                        }
                        stroke={
                          highlightedNode === node.value && node.value !== 5
                            ? 5 < (n?.value || Number.MAX_SAFE_INTEGER)
                              ? "red"
                              : "green"
                            : "black"
                        }
                      />
                      {/* for each line, write text on the halfway point in the form: `${currentValue} ?< ${nextValue}` */}
                      {highlightedNode === node.value && node.value !== 5 && (
                        <text
                          x={
                            (TEXT_X_POSITION +
                              (n && n.value !== null
                                ? TEXT_X_POSITION +
                                  (sl.indexOf(n.value) - index) *
                                    (RECT_WIDTH + RECT_PADDING) +
                                  RECT_WIDTH / 1.5
                                : TEXT_X_POSITION +
                                  (sl.size() - index + 1) *
                                    (RECT_WIDTH + RECT_PADDING) -
                                  25)) /
                            2
                          }
                          y={i * RECT_HEIGHT + TEXT_Y_OFFSET - 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="black"
                          fontSize="10"
                        >
                          {`${5} <= ${n?.value || "END"}`}
                        </text>
                      )}
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
              <Fragment key={`gn-tail${i}`}>
                {n && (
                  <g>
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
              </Fragment>
            ))}
          </g>
        </svg>
      </div>
      {/* generate new sl */}
      <div className="text-center mt-4">
        {!(highlightedNode === 5)
          ? `Searching for node 5 in the Skip List. Click next to see the next step. ${count === -1 ? "" : `Current step:  ${count}`}`
          : `Found node 5 in ${count} steps. Click on the button to generate a new Skip List.`}
      </div>
      <button
        onClick={() => {
          const newSl = new SkipList<number>(SKIP_LIST_HEIGHT, 0.6);
          for (let i = 1; i < 8; i++) {
            newSl.insert(i);
          }
          setSl(newSl);
          setHighlightedNode(null);
          searchGenerator.current = newSl.getGenerator(5);
          setCount(-1);
        }}
        className="mx-auto mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generate new Skip List
      </button>
      {highlightedNode !== 5 && (
        <button
          onClick={handleNext}
          className="mx-auto mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Next
        </button>
      )}
    </div>
  );
}
