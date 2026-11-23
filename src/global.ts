import { CherryBlossom } from "./cherryblossom";

// Mount directly to window for vanilla CDN <script> tags
if (typeof window !== "undefined") {
  (window as unknown as { CherryBlossom: typeof CherryBlossom }).CherryBlossom = CherryBlossom;
}

export { CherryBlossom };
export default CherryBlossom;
