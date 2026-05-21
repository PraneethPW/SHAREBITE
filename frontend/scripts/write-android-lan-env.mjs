import { networkInterfaces } from "node:os";
import { writeFileSync } from "node:fs";

function findLanIp() {
  const nets = networkInterfaces();
  const candidates = [];

  for (const entries of Object.values(nets)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal && !entry.address.startsWith("169.254.")) {
        candidates.push(entry.address);
      }
    }
  }

  return candidates.find((ip) => ip.startsWith("192.168.")) || candidates.find((ip) => ip.startsWith("10.")) || candidates[0];
}

const ip = process.argv[2] || findLanIp();

if (!ip) {
  console.error("Could not detect a LAN IP. Run: node scripts/write-android-lan-env.mjs YOUR_IP");
  process.exit(1);
}

const content = `VITE_API_URL=http://${ip}:5000
VITE_APP_URL_LOCAL=https://localhost
`;

writeFileSync(".env.android-lan.local", content);
console.log(`Android LAN API set to http://${ip}:5000`);
