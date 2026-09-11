/**
 * COMMANDE GOUVERNEMENTALE — le chèque arrive après la livraison, il faut
 * pouvoir l'enregistrer.
 *
 * Le 3 septembre 2026, « Marquer payé » a été retiré à ces clients : deux
 * commandes avaient été déclarées réglées alors qu'aucun chèque n'était arrivé.
 * La protection était juste, mais elle ne laissait AUCUN endroit pour constater
 * le paiement quand il arrivait vraiment (commande 103, chèque reçu le
 * 11 septembre 2026, signalé par Fanny).
 *
 * Test FONCTIONNEL : vrai contrôleur, vraie base. On vérifie que le chemin
 * « chèque reçu » solde bien la commande, ET que le garde-fou d'origine tient
 * toujours — « Marquer payé » reste refusé.
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
  orderItem,
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

/** Commande gouvernementale livrée, en attente du chèque. */
async function commandeGouvernementale(over: any = {}) {
  const Order = (await import("../../src/models/Order.js")).default;
  return Order.create({
    userId: "69b40515f8866a250a6d4599",
    clientInfo,
    pickupDate: new Date(Date.now() - 2 * 864e5),
    pickupLocation: "Laval",
    deliveryType: "pickup",
    items: [orderItem({ quantity: 10, amount: 209.5 })],
    subtotal: 209.5,
    taxAmount: 31.35,
    tpsAmount: 10.48,
    tvqAmount: 20.87,
    deliveryFee: 0,
    total: 240.85,
    depositAmount: 240.85,
    paymentType: "full",
    paymentStatus: "unpaid",
    amountPaid: 0,
    billingKind: "gouvernement",
    billingOrganization: "Ville de Laval",
    status: "completed",
    orderNumber: `MF-TEST-${Math.floor(Math.random() * 1e6)}`,
    ...over,
  });
}

async function enregistrerCheque(order: any, body: any) {
  const { recordChequePayment } = await import("../../src/controllers/order.controller.js");
  const res = fakeRes();
  await recordChequePayment(fakeReq(body, { id: String(order._id) }) as any, res as any);
  return res;
}

describe("Commande gouvernementale : réception du chèque", () => {
  test("le chèque reçu solde la commande", async () => {
    const order = await commandeGouvernementale();

    const res = await enregistrerCheque(order, {
      amount: 240.85,
      chequeNumber: "001234",
      recordedByName: "Fanny",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const Order = (await import("../../src/models/Order.js")).default;
    const after: any = await Order.findById(order._id).lean();
    expect(after.paymentStatus).toBe("paid");
    expect(after.amountPaid).toBe(240.85);
    expect(after.balancePaid).toBe(true);
    expect(after.depositPaid).toBe(true);
  });

  test("le chèque est consigné comme pièce comptable (numéro, montant, qui)", async () => {
    const order = await commandeGouvernementale();
    await enregistrerCheque(order, {
      amount: 240.85,
      chequeNumber: "001234",
      receivedAt: "2026-09-11",
      recordedByName: "Fanny",
    });

    const Order = (await import("../../src/models/Order.js")).default;
    const after: any = await Order.findById(order._id).lean();

    expect(after.chequePayments).toHaveLength(1);
    expect(after.chequePayments[0].chequeNumber).toBe("001234");
    expect(after.chequePayments[0].amount).toBe(240.85);
    expect(after.chequePayments[0].recordedByName).toBe("Fanny");

    const trace = (after.changeHistory || []).find((h: any) =>
      String(h.notes || "").includes("chèque n° 001234"),
    );
    expect(trace).toBeTruthy();
    expect(trace.notes).toContain("Fanny");
  });

  test("sans montant précisé, le chèque couvre le reste dû", async () => {
    const order = await commandeGouvernementale();
    const res = await enregistrerCheque(order, { recordedByName: "Fanny" });

    expect(res.statusCode).toBe(200);
    const Order = (await import("../../src/models/Order.js")).default;
    const after: any = await Order.findById(order._id).lean();
    expect(after.amountPaid).toBe(240.85);
    expect(after.paymentStatus).toBe("paid");
  });

  test("un chèque partiel laisse le solde visible, un second le solde", async () => {
    const order = await commandeGouvernementale();

    await enregistrerCheque(order, { amount: 100, recordedByName: "Fanny" });
    const Order = (await import("../../src/models/Order.js")).default;
    let after: any = await Order.findById(order._id).lean();
    expect(after.amountPaid).toBe(100);
    expect(after.paymentStatus).toBe("deposit_paid");
    expect(after.balancePaid).toBe(false);

    await enregistrerCheque(after, { amount: 140.85, recordedByName: "Fanny" });
    after = await Order.findById(order._id).lean();
    expect(after.amountPaid).toBe(240.85);
    expect(after.paymentStatus).toBe("paid");
    expect(after.chequePayments).toHaveLength(2);
  });

  test("un chèque plus gros que le solde ne sur-paie pas la commande", async () => {
    const order = await commandeGouvernementale();
    await enregistrerCheque(order, { amount: 500, recordedByName: "Fanny" });

    const Order = (await import("../../src/models/Order.js")).default;
    const after: any = await Order.findById(order._id).lean();
    expect(after.amountPaid).toBe(240.85);
  });

  test("le nom de la personne qui constate la réception est obligatoire", async () => {
    const order = await commandeGouvernementale();
    const res = await enregistrerCheque(order, { amount: 240.85, recordedByName: "  " });

    expect(res.statusCode).toBe(400);
    const Order = (await import("../../src/models/Order.js")).default;
    const after: any = await Order.findById(order._id).lean();
    expect(after.paymentStatus).toBe("unpaid");
  });

  test("une commande déjà payée est refusée (pas de double encaissement)", async () => {
    const order = await commandeGouvernementale({
      paymentStatus: "paid",
      amountPaid: 240.85,
      depositPaid: true,
      balancePaid: true,
    });
    const res = await enregistrerCheque(order, { amount: 240.85, recordedByName: "Fanny" });

    expect(res.statusCode).toBe(400);
    expect(String(res.body.error)).toContain("déjà entièrement payée");
  });

  test("le garde-fou d'origine tient : « Marquer payé » reste refusé", async () => {
    const order = await commandeGouvernementale();
    const { updateOrder } = await import("../../src/controllers/order.controller.js");
    const res = fakeRes();
    await updateOrder(
      fakeReq({ depositPaid: true, balancePaid: true }, { id: String(order._id) }) as any,
      res as any,
    );

    expect(res.statusCode).toBe(400);
    const Order = (await import("../../src/models/Order.js")).default;
    const after: any = await Order.findById(order._id).lean();
    expect(after.paymentStatus).toBe("unpaid");
  });
});
