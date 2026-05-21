import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";

const candidates = [
  process.env.ADB,
  join(process.env.LOCALAPPDATA || "", "Android", "Sdk", "platform-tools", "adb.exe"),
  join(homedir(), "AppData", "Local", "Android", "Sdk", "platform-tools", "adb.exe"),
  "adb"
].filter(Boolean);

const adb = candidates.find((candidate) => candidate === "adb" || existsSync(candidate));

if (!adb) {
  console.error("adb was not found. Install Android SDK Platform Tools or set ADB=C:\\path\\to\\adb.exe");
  process.exit(1);
}

const devices = spawnSync(adb, ["devices"], { encoding: "utf8", stdio: "pipe" });
process.stdout.write(devices.stdout || "");
process.stderr.write(devices.stderr || "");

if (devices.status !== 0) process.exit(devices.status || 1);
if (/\boffline\b/.test(devices.stdout)) {
  console.error("Android device is offline. Unlock the phone, accept the USB debugging prompt, then reconnect USB.");
  process.exit(1);
}
if (!/\bdevice\b/m.test(devices.stdout.replace("List of devices attached", ""))) {
  console.error("No authorized Android device found. Connect the phone and enable USB debugging.");
  process.exit(1);
}

const reverse = spawnSync(adb, ["reverse", "tcp:5000", "tcp:5000"], { encoding: "utf8", stdio: "pipe" });
process.stdout.write(reverse.stdout || "");
process.stderr.write(reverse.stderr || "");

if (reverse.status !== 0) process.exit(reverse.status || 1);
console.log("Android USB tunnel ready: phone http://127.0.0.1:5000 -> laptop http://127.0.0.1:5000");
