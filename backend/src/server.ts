import { server } from "./app.js";
import { PORT } from "./config/index.js";
import { prisma } from "./lib/prisma.js";

async function main() {
  await prisma.$connect();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
