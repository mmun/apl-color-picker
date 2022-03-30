import fs from "fs";
import path from "path";
import yaml from "yaml";
import colorString from "color-string";

const colorsYamlPath = path.join("app/services/colors.yml");
const colorsYaml = fs.readFileSync(colorsYamlPath, "utf8");
const colors = yaml.parse(colorsYaml);
const flatColors: any[] = [];

function visit(node: object | string, colorPath: string[]) {
    if (typeof node === "string") {
        flatColors.push({
            name: colorPath.join('.'),
            rgba: colorString.get.rgb(node)
        })
    } else {
        for (let [key, childNode] of Object.entries(node)) {
            visit(childNode, [...colorPath, key]);
        }
    }
}

visit(colors, []);

export function getColors() {
    return flatColors;
}
