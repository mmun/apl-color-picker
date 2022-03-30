import { ChangeEvent, MouseEvent, useRef, useState } from "react";
import { useLoaderData } from "remix";
import { getColors } from "~/services/colors";

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

          let context = canvas.getContext('2d')!;
          context.drawImage(image, 0, 0, image.width, image.height);
        };

        image.src = fileReader.result as string;
      };

      fileReader.readAsDataURL(files[0]);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    let canvas = canvasRef.current!;
    let context = canvas.getContext('2d')!;
    let data = context.getImageData(event.nativeEvent.offsetX, event.nativeEvent.offsetY, 1, 1).data;
    let [r, g, b, a] = data;
    a /= 255;
    setActiveColor(`rgba(${r}, ${g}, ${b}, ${a})`);

    let sortedColors = colorData.map((color: any) => {
      let dr = r - color.rgba[0];
      let dg = g - color.rgba[1];
      let db = b - color.rgba[2];
      let da = (a - color.rgba[3]) * 255;
      let score = Math.sqrt(dr*dr + dg*dg + db*db + da*da);
      return { ...color, score};
    });

    sortedColors.sort((c1, c2) => c1.score - c2.score);

    setSortedColors(sortedColors);
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: "1 1 0%", fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
        <div style={{ marginBottom: "24px;" }}>
          <h2>APL Color Lookup</h2>
          <div>
            <label htmlFor="loadImage" style={{ border: "1px solid black", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
              Load an image
            </label>
            <input type="file" id="loadImage" hidden onChange={handleLoadImage}></input>
          </div>
        </div>
        <div>
          <canvas style={{ width: "100%", objectFit: "contain" }} onMouseMove={handleMouseMove} ref={canvasRef}></canvas>
        </div>
      </div>
      <div style={{ flex: "none", width: "20vw", fontFamily: "sans-serif", borderLeft: "1px solid black" }}>
        <div style={{ backgroundColor: activeColor, marginTop: "4px", height: "32px" }}>
        </div>
        <div style={{ padding: "8px 0", textAlign: "center"}}>
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
                <div style={{color: "#999"}}>{cssColor}</div>
                <div style={{color: "#999"}}>Diff score: {Math.trunc(color.score)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}