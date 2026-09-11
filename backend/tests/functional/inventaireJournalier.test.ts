/**
 * INVENTAIRE JOURNALIER — un produit ajouté à la main doit récolter les
 * commandes du site qui portent le même produit.
 *
 * Signalé par Fanny le 11 septembre 2026 : elle ajoute « torsade pomme » à la
 * liste journalière, met le produit en ligne, et la colonne « Comm CLIENT »
 * reste à zéro. Deux causes empilées :
 *
 *  1. la liste éditable ne partait JAMAIS au serveur — sa clé de rangement
 *     (« __products_config_daily ») était refusée par le motif de date, erreur
 *     400 avalée en silence à l'écran. Le serveur rapprochait donc les commandes
 *     de sa liste codée en dur, où « torsade pomme » n'existe pas ;
 *  2. même la liste enregistrée, un nom de site plus long que la ligne
 *     (« Torsade aux pommes fondantes et cannelle. ») créait une ligne
 *     orpheline au lieu de tomber sur la ligne de Fanny.
 *
 * Test FONCTIONNEL : vraie validation, vrai contrôleur, vraie base.
 */
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { resetSquare, resetMail } from "../setup";
import {
  connectTestDb,
  clearTestDb,
  disconnectTestDb,
  seedProducts,
  fakeReq,
  fakeRes,
  clientInfo,
} from "../helpers";

beforeAll(async () => {
  await connectTestDb();
});
afterAll(async () => {
  await disconnectTestDb();
});
beforeEach(async () => {
  await clearTestDb();
  await seedProducts();
  resetSquare();
  resetMail();
});

const LISTE_JOURNALIERE = "__products_config_daily";
const NOM_SUR_LE_SITE = "Torsade aux pommes fondantes et cannelle.";
const LIGNE_DE_FANNY = "torsade pomme";

/** Enregistre la liste de produits telle que l'écran l'envoie. */
async function enregistrerListe(noms: string[]) {
  const { saveDailyInventory } = await import(
    "../../src/controllers/dailyInventory.controller.js"
  );
  const res = fakeRes();
  await saveDailyInventory(
    fakeReq({
      date: LISTE_JOURNALIERE,
      entries: noms.map((name) => ({
        productId: name,
        productName: name,
        stock_stdo: 0,
        stdo: 0,
        berri: 0,
        comm_berri: 0,
        client: 0,
        total: 0,
      })),
    }) as any,
    res as any,
  );
  return res;
}

/** Commande du jour contenant le produit du site. */
async function commandeDuJour(date: string, productName: string, quantity: number) {
  const Order = (await import("../../src/models/Order.js")).default;
  return Order.create({
    userId: "69b40515f8866a250a6d4599",
    clientInfo,
    pickupDate: new Date(`${date}T12:00:00.000Z`),
    pickupLocation: "Laval",
    deliveryType: "pickup",
    items: [
      { productId: 42, productName, quantity, unitPrice: 4.25, amount: 4.25 * quantity },
    ],
    subtotal: 4.25 * quantity,
    taxAmount: 0,
    deliveryFee: 0,
    total: 4.25 * quantity,
    depositAmount: 4.25 * quantity,
    paymentType: "full",
    paymentStatus: "unpaid",
    status: "pending",
    orderNumber: `MF-TEST-${Math.floor(Math.random() * 1e6)}`,
  });
}

async function colonneClient(date: string) {
  const { getInventoryComputedClient } = await import(
    "../../src/controllers/dailyInventory.controller.js"
  );
  const res = fakeRes();
  await getInventoryComputedClient(fakeReq({}, {}, { date }) as any, res as any);
  return res;
}

describe("Inventaire journalier : un produit ajouté récolte ses commandes", () => {
  test("la liste de produits de l'écran est acceptée et conservée", async () => {
    const res = await enregistrerListe(["Croissant", LIGNE_DE_FANNY]);
    expect(res.statusCode).toBe(200);

    const { loadInventoryLists } = await import(
      "../../src/controllers/dailyInventory.controller.js"
    );
    const { journalier } = await loadInventoryLists();
    expect(journalier).toContain(LIGNE_DE_FANNY);
  });

  test("la validation accepte la clé de rangement de la liste", async () => {
    const { saveDailyInventorySchema, dailyInventoryQuerySchema } = await import(
      "../../src/schemas/dailyInventory.schema.js"
    );
    expect(dailyInventoryQuerySchema.safeParse({ date: LISTE_JOURNALIERE }).success).toBe(true);
    expect(dailyInventoryQuerySchema.safeParse({ date: "__products_config_four" }).success).toBe(true);
    expect(dailyInventoryQuerySchema.safeParse({ date: "2026-09-11" }).success).toBe(true);
    // Une vraie saisie erronée reste refusée.
    expect(dailyInventoryQuerySchema.safeParse({ date: "11-09-2026" }).success).toBe(false);
    expect(
      saveDailyInventorySchema.safeParse({
        date: LISTE_JOURNALIERE,
        entries: [
          {
            productId: LIGNE_DE_FANNY,
            productName: LIGNE_DE_FANNY,
            stock_stdo: 0,
            stdo: 0,
            berri: 0,
            comm_berri: 0,
            client: 0,
            total: 0,
          },
        ],
      }).success,
    ).toBe(true);
  });

  test("LE CAS DE FANNY : « torsade pomme » ajoutée → les commandes tombent dessus", async () => {
    const date = new Date().toISOString().split("T")[0];
    await enregistrerListe(["Croissant", LIGNE_DE_FANNY]);
    await commandeDuJour(date, NOM_SUR_LE_SITE, 12);

    const res = await colonneClient(date);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.journalier[LIGNE_DE_FANNY]).toBe(12);
    // Et surtout : aucune ligne orpheline au nom interminable.
    expect(res.body.data.journalier[NOM_SUR_LE_SITE]).toBeUndefined();
  });

  test("plusieurs commandes du jour s'additionnent sur la ligne", async () => {
    const date = new Date().toISOString().split("T")[0];
    await enregistrerListe([LIGNE_DE_FANNY]);
    await commandeDuJour(date, NOM_SUR_LE_SITE, 12);
    await commandeDuJour(date, "Torsade au pommes fondantes et cannelle.", 1);

    const res = await colonneClient(date);
    expect(res.body.data.journalier[LIGNE_DE_FANNY]).toBe(13);
  });

  test("une commande annulée ne compte pas", async () => {
    const date = new Date().toISOString().split("T")[0];
    await enregistrerListe([LIGNE_DE_FANNY]);
    const order = await commandeDuJour(date, NOM_SUR_LE_SITE, 12);
    const Order = (await import("../../src/models/Order.js")).default;
    await Order.updateOne({ _id: order._id }, { $set: { status: "cancelled" } });

    const res = await colonneClient(date);
    expect(res.body.data.journalier[LIGNE_DE_FANNY]).toBeUndefined();
  });

  test("un produit hors liste ne s'invite pas dans la feuille", async () => {
    const date = new Date().toISOString().split("T")[0];
    await enregistrerListe([LIGNE_DE_FANNY]);
    await commandeDuJour(date, "Gâteau d'anniversaire sur mesure", 3);

    const res = await colonneClient(date);
    expect(Object.keys(res.body.data.journalier)).toHaveLength(0);
  });

  test("le nom exact du site l'emporte sur une ligne générique", async () => {
    // « Croissant » (exact) ne doit pas être avalé par une ligne plus longue.
    const { computeInventoryBuckets } = await import(
      "../../src/utils/inventoryBuckets.js"
    );
    const { journalierQty } = computeInventoryBuckets(
      [{ productName: "Croissant", quantity: 4 }],
      ["Croissant", "Croissant amandes"],
      [],
    );
    expect(journalierQty["Croissant"]).toBe(4);
    expect(journalierQty["Croissant amandes"]).toBeUndefined();
  });

  test("un nom de site plus COURT que la ligne garde sa propre ligne (pas de fusion à l'aveugle)", async () => {
    const { computeInventoryBuckets } = await import(
      "../../src/utils/inventoryBuckets.js"
    );
    const { journalierQty } = computeInventoryBuckets(
      [{ productName: "Croissant", quantity: 4 }],
      ["Croissant amandes"],
      [],
    );
    expect(journalierQty["Croissant amandes"]).toBeUndefined();
    expect(journalierQty["Croissant"]).toBe(4);
  });

  test("entre deux lignes possibles, la plus précise gagne", async () => {
    const { computeInventoryBuckets } = await import(
      "../../src/utils/inventoryBuckets.js"
    );
    const { journalierQty } = computeInventoryBuckets(
      [{ productName: NOM_SUR_LE_SITE, quantity: 5 }],
      ["torsade", LIGNE_DE_FANNY],
      [],
    );
    expect(journalierQty[LIGNE_DE_FANNY]).toBe(5);
    expect(journalierQty["torsade"]).toBeUndefined();
  });
});
