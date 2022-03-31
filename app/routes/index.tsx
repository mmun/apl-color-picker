import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useLoaderData } from "remix";
import { getColors } from "~/services/colors";
import colorDiff from "color-diff";

export function loader() {
  return getColors();
}

export default function Index() {
  const colorData = useLoaderData();

  const [activeColor, setActiveColor] = useState<any>();
  const [sortedColors, setSortedColors] = useState<any[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handleLoadImage(event: ChangeEvent) {
    let fileInput = event.target as HTMLInputElement;
    let files = fileInput.files!;

    if (files.length > 0) {
      let fileReader = new FileReader();

      fileReader.onload = () => {
        let image = new Image();

        image.onload = () => {
          let canvas = canvasRef.current!;

          canvas.width = image.width;
          canvas.height = image.height;

          let context = canvas.getContext("2d")!;
          context.drawImage(image, 0, 0, image.width, image.height);
        };

        image.src = fileReader.result as string;
      };

      fileReader.readAsDataURL(files[0]);
    }
  }

  useEffect(() => {
    let canvas = canvasRef.current!;
    let context = canvas.getContext("2d")!;
    let gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1 / 6, "orange");
    gradient.addColorStop(2 / 6, "yellow");
    gradient.addColorStop(3 / 6, "green");
    gradient.addColorStop(4 / 6, "blue");
    gradient.addColorStop(5 / 6, "indigo");
    gradient.addColorStop(1, "violet");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1 / 2, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(1 / 2, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [])

  function handleMouseMove(event: MouseEvent) {
    let canvas = canvasRef.current!;
    let context = canvas.getContext("2d")!;

    let scale = canvas.width / canvas.getBoundingClientRect().width;
    let x = Math.trunc(event.nativeEvent.offsetX * scale);
    let y = Math.trunc(event.nativeEvent.offsetY * scale);
    let data = context.getImageData(x, y, 1, 1).data;
    let [r, g, b, a] = data;
    a /= 255;
    setActiveColor(`rgba(${r}, ${g}, ${b}, ${a})`);

    let sortedColors = colorData.map((color: any) => {
      let lab1 = colorDiff.rgb_to_lab({ R: r, G: g, B: b, A: a });
      let lab2 = colorDiff.rgb_to_lab({ R: color.rgba[0], G: color.rgba[1], B: color.rgba[2], A: color.rgba[3] });
      let delta = colorDiff.diff(lab1, lab2);
      return { ...color, delta };
    });

    sortedColors.sort((c1: any, c2: any) => c1.delta - c2.delta);

    setSortedColors(sortedColors);
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ textAlign: "center", flex: "1 1 0%", fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
        <div style={{ marginBottom: "48px;" }}>
          <h2>APL Color Lookup</h2>
          <div>
            <label htmlFor="loadImage" style={{ border: "1px solid black", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
              Load an image
            </label>
            <input type="file" id="loadImage" hidden onChange={handleLoadImage}></input>
          </div>
        </div>
        <div>
          <canvas style={{ width: "100%", objectFit: "contain", cursor: "crosshair" }} onMouseMove={handleMouseMove} ref={canvasRef}></canvas>
        </div>
      </div>
      <div style={{ flex: "none", width: "20vw", fontFamily: "sans-serif", borderLeft: "1px solid black" }}>
        <div style={{
          backgroundImage: "linear-gradient(45deg, #DDDDDD 25%, transparent 25%), linear-gradient(-45deg, #DDDDDD 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #DDDDDD 75%), linear-gradient(-45deg, transparent 75%, #DDDDDD 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px"
        }}>
          <div style={{ backgroundColor: activeColor, marginTop: "4px", height: "32px" }}></div>
        </div>
        <div style={{ padding: "8px 0", textAlign: "center" }}>
          {activeColor}
        </div>
        {sortedColors.map((color: any) => {
          let name = color.name;
          let [r, g, b, a] = color.rgba;
          let cssColor = `rgba(${r}, ${g}, ${b}, ${a})`;

          return (
            <div key={color.name} style={{ display: "flex", alignItems: "center", fontSize: "11px", lineHeight: "1.5" }}>
              <div style={{ margin: "8px", width: "48px", height: "48px", backgroundColor: cssColor }}>
              </div>
              <div>
                <div>{color.name}</div>
                <div style={{ color: "#999" }}>{cssColor}</div>
                <div style={{ color: "#999" }}>Delta: {color.delta.toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
