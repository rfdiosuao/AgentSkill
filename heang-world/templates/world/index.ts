import type { WorldDef } from "../types";
import "./world.css";

// TEMPLATE — copy this folder to src/worlds/<id>/ and replace every __PLACEHOLDER__.
const world: WorldDef = {
  id: "__ID__",
  no: "__NO__", // next free number, e.g. "08"; controls order in pickers
  name: "__中文名__",
  en: "__ENGLISH NAME__",
  swatch: ["__GROUND_HEX__", "__ACCENT_HEX__"],
  // pick ONE kind of backdrop (or image + backdrop for a live layer over a painting):
  image: "/dims/__ID__.jpg", // put the file in public/dims/
  // video: "/dims/__ID__.mp4",  // muted loop, image becomes the poster
  // backdrop: () => import("./Backdrop"),  // live canvas / 3D, see Backdrop.tsx
  motto: "__CORNER COPY__",
  coords: "__SECOND CORNER LINE__",
};
export default world;
