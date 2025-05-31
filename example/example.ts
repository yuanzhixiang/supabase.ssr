// example/example.ts
import { createBrowserClient } from "../src/createBrowserClient";

createBrowserClient("https://localhost:3000", "1234567890", {
  isSingleton: false,
});