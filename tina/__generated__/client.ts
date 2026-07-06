import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '2d2673c90ce60390c7397683b9151403063785e5', queries,  });
export default client;
  