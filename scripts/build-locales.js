import fs from "fs";

// eslint-disable-next-line no-undef
const rootDir = process.cwd();
const srcDir = `${rootDir}/src/i18n/locales`;
const distDir = `${rootDir}/libs/locales`;

const reConvert = /export default (\{\s+)([\w'-]+):([\s\S]+\})\n\};/m;
const rePropNameFix = /\.('\w+-\w+')/;

if (fs.existsSync(distDir)) {
  // empty dist dir
  fs.readdirSync(distDir).forEach((file) => {
    fs.unlinkSync(`${distDir}/${file}`);
  });
} else {
  fs.mkdirSync(distDir, { recursive: true });
}
// copy locales to dist
fs.readdirSync(srcDir).forEach((file) => {
  const src = fs.readFileSync(`${srcDir}/${file}`, "utf8");
  const output = src
    .replace(reConvert, "(function () $1Datepicker.locales.$2 =$3;\n}());")
    .replace(rePropNameFix, "[$1]");
  fs.writeFileSync(`${distDir}/${file}`, output);
});
