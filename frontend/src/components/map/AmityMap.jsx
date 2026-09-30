import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const CENTER = [77.3336, 28.5445];

const BOUNDS = [
  [77.3285, 28.5405],
  [77.339, 28.549],
];

const POLYGON = [
  [77.336901, 28.545001],
  [77.333156, 28.541775],
  [77.332348, 28.542487],
  [77.330849, 28.541231],
  [77.329625, 28.542417],
  [77.331679, 28.544176],
  [77.332055, 28.543797],
  [77.332824, 28.544463],
  [77.331930, 28.545343],
  [77.331787, 28.545502],
  [77.332577, 28.546223],
  [77.332010, 28.546805],
  [77.333505, 28.548107],
];

const EXCLUDED_POLYGON = [
  [77.333676, 28.545193],
  [77.333370, 28.545493],
  [77.333552, 28.545661],
  [77.332871, 28.546318],
  [77.333425, 28.546777],
  [77.334200, 28.546082],
  [77.333836, 28.545764],
  [77.334087, 28.545513],
];

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

export default function AmityMap() {
  const container = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const timerRef = useRef(null);

  const [point, setPoint] = useState(null);
  const [copied, setCopied] = useState(null);
  const [status, setStatus] = useState("Loading map...");

  useEffect(() => {
    const map = new MapLibreMap({
      container: container.current,

      style: {
        version: 8,

        projection: {
          type: "globe",
        },

        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
        },

        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
          },
        ],

        sky: {
          "atmosphere-blend": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 1,
            5, 1,
            7, 0,
          ],
        },

        light: {
          anchor: "map",
          position: [1.5, 90, 80],
        },
      },

      center: [77.3331, 28.5445],
      zoom: 0,

      minZoom: 0,
      maxZoom: 17,
    });

    map.on("load", () => {
      setStatus("Map loaded");

      const target = [77.3331, 28.5445];

      // Start as a globe
      map.setProjection({
        type: "globe",
      });

      // Give the globe a moment to render
      setTimeout(() => {
        map.flyTo({
          center: target,
          zoom: 16,
          bearing: 55,

          speed: 5.0,
          curve: 1.2,

          easing(t) {
            return t;
          },

          essential: true,
        });
      }, 400);
    });

    const NS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(NS, "svg");

    Object.assign(svg.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      overflow: "visible",
    });

    const shade = document.createElementNS(NS, "path");
    shade.setAttribute("fill", "#05080d");
    shade.setAttribute("fill-opacity", "0.80");
    shade.setAttribute("fill-rule", "evenodd");

    svg.appendChild(shade);

    const poly = document.createElementNS(NS, "polygon");
    poly.setAttribute("fill", "none");
    poly.setAttribute("stroke", "#ffffff");
    poly.setAttribute("stroke-width", "2");
    poly.setAttribute("stroke-linejoin", "round");

    svg.appendChild(poly);

    const excludedPoly = document.createElementNS(NS, "polygon");
    excludedPoly.setAttribute("fill", "none");
    excludedPoly.setAttribute("stroke", "#ffffff50");
    excludedPoly.setAttribute("stroke-width", "2");
    excludedPoly.setAttribute("stroke-linejoin", "round");

    svg.appendChild(excludedPoly);

    map.getCanvasContainer().appendChild(svg);

    const drawPolygon = () => {
      const pts = POLYGON.map((p) => map.project(p));
      const list = pts.map((p) => `${p.x},${p.y}`);

      poly.setAttribute("points", list.join(" "));

      const excludedPts = EXCLUDED_POLYGON.map((p) => map.project(p));
      const excludedList = excludedPts.map((p) => `${p.x},${p.y}`);

      excludedPoly.setAttribute(
        "points",
        excludedList.join(" ")
      );

      const {
        clientWidth: w,
        clientHeight: h,
      } = map.getContainer();

      const pad = 200;

      shade.setAttribute(
        "d",
        `
          M${-pad},${-pad}
          H${w + pad}
          V${h + pad}
          H${-pad}
          Z

          M${list.join(" L")} Z

          M${excludedList.join(" L")} Z
        `
      );
    };

    map.on("render", drawPolygon);

    drawPolygon();

    map.getCanvas().style.cursor = "crosshair";

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new Marker({
          color: "#ff3b30",
        })
          .setLngLat([lng, lat])
          .addTo(map);
      }

      setPoint({ lat, lng });
      setCopied(null);
    });

    mapRef.current = map;

    return () => {
      clearTimeout(timerRef.current);
      map.remove();
    };
  }, []);

  const latlng = point
    ? `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`
    : "";

  const lnglat = point
    ? `[${point.lng.toFixed(6)}, ${point.lat.toFixed(6)}]`
    : "";

  const handleCopy = async (kind, text) => {
    const ok = await copyText(text);

    if (!ok) return;

    setCopied(kind);

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  const btn = (active) => ({
    padding: "6px 10px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.35)",
    background: active
      ? "#2e9e5b"
      : "rgba(255,255,255,0.12)",
    color: "#fff",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
      }}
    >
      <div
        ref={container}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          padding: "4px 8px",
          borderRadius: 6,
          background: "rgba(15, 20, 25, 0.85)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
        }}
      >
        {status}
      </div>

      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          maxWidth: "calc(100% - 24px)",
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(15, 20, 25, 0.85)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
        }}
      >
        {point ? (
          <>
            <div
              style={{
                fontVariantNumeric: "tabular-nums",
                marginBottom: 8,
              }}
            >
              <div>Lat: {point.lat.toFixed(6)}</div>
              <div>Lng: {point.lng.toFixed(6)}</div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                style={btn(copied === "latlng")}
                onClick={() =>
                  handleCopy("latlng", latlng)
                }
              >
                {copied === "latlng"
                  ? "Copied"
                  : "Copy lat, lng"}
              </button>

              <button
                style={btn(copied === "lnglat")}
                onClick={() =>
                  handleCopy("lnglat", lnglat)
                }
              >
                {copied === "lnglat"
                  ? "Copied"
                  : "Copy [lng, lat]"}
              </button>
            </div>
          </>
        ) : (
          <span></span>
        )}
      </div>
    </div>
  );
}