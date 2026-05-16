import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const app = createApp();

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection", reason);
});
process.on("uncaughtException", (e) => {
  console.error("uncaughtException", e);
});

app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
