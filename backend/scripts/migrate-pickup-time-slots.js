import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI manquant dans l'environnement");
  process.exit(1);
}

// Pass --dry-run (or -n) to preview without writing.
const DRY_RUN = process.argv.includes("--dry-run") || process.argv.includes("-n");

// Extract HH:MM from a Date in the given IANA timezone.
// We use America/Toronto because the bakery is in Quebec — most pickupDate
// values were stored from Montreal-based customer browsers, where the typed
// hour was already converted to Montreal local time before .toISOString().
function extractHHMM(date, timeZone = "America/Toronto") {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

const client = new MongoClient(MONGODB_URI);

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const orders = db.collection("orders");

    console.log(
      `🔄 Migration deliveryTimeSlot pour les commandes existantes${DRY_RUN ? " (DRY-RUN)" : ""}...`,
    );

    // Target: orders where deliveryTimeSlot is missing OR empty string,
    // AND we have a pickupDate or deliveryDate to derive a time from.
    const query = {
      $and: [
        {
          $or: [
            { deliveryTimeSlot: { $exists: false } },
            { deliveryTimeSlot: null },
            { deliveryTimeSlot: "" },
          ],
        },
        {
          $or: [
            { pickupDate: { $exists: true, $ne: null } },
            { deliveryDate: { $exists: true, $ne: null } },
          ],
        },
      ],
    };

    const candidates = await orders.find(query).toArray();
    console.log(`📊 Commandes candidates: ${candidates.length}`);

    let updated = 0;
    let skippedMidnight = 0;
    let skippedNoDate = 0;
    const samples = [];

    for (const order of candidates) {
      let derived = "";
      let source = "";

      if (order.pickupDate) {
        const d = new Date(order.pickupDate);
        if (!Number.isNaN(d.getTime())) {
          derived = extractHHMM(d);
          source = "pickupDate";
        }
      }

      // For pure-delivery orders the time may live elsewhere; fall back to
      // deliveryDate if it carries a time component (some legacy rows do).
      if (!derived && order.deliveryDate) {
        const d = new Date(order.deliveryDate);
        if (!Number.isNaN(d.getTime())) {
          const hhmm = extractHHMM(d);
          if (hhmm !== "00:00") {
            derived = hhmm;
            source = "deliveryDate";
          }
        }
      }

      if (!derived) {
        skippedNoDate += 1;
        continue;
      }

      // 00:00 means the time was never really set (the form defaulted it).
      // Don't backfill those — they'd lie about a 00 h 00 pickup.
      if (derived === "00:00") {
        skippedMidnight += 1;
        continue;
      }

      if (samples.length < 10) {
        samples.push({
          orderNumber: order.orderNumber,
          pickupDate: order.pickupDate,
          deliveryDate: order.deliveryDate,
          source,
          derivedTimeSlot: derived,
        });
      }

      if (!DRY_RUN) {
        await orders.updateOne(
          { _id: order._id },
          { $set: { deliveryTimeSlot: derived, updatedAt: new Date() } },
        );
      }
      updated += 1;
    }

    console.log("");
    console.log("✅ Résumé");
    console.log(`- Commandes ${DRY_RUN ? "à mettre à jour" : "mises à jour"}: ${updated}`);
    console.log(`- Ignorées (00:00, pas de vraie heure): ${skippedMidnight}`);
    console.log(`- Ignorées (aucune date exploitable): ${skippedNoDate}`);

    if (samples.length > 0) {
      console.log("");
      console.log("🔍 Exemples (max 10):");
      console.table(samples);
    }

    if (DRY_RUN) {
      console.log("");
      console.log("ℹ️  Mode dry-run: aucune écriture. Relance sans --dry-run pour appliquer.");
    }
  } catch (error) {
    console.error("❌ Erreur migration deliveryTimeSlot:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
