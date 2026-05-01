import { Request, Response } from "express";
import Order from "../models/Order.js";
import { 
  sendPaymentReminderEmail,
  sendPaymentOverdueEmail 
} from "../utils/mail.js";

interface OrderWithBilling {
  _id: import("mongoose").Types.ObjectId;
  orderNumber: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  billingKind: "standard" | "representant" | "gouvernement";
  paymentDueDate?: Date;
  paymentStatus: "unpaid" | "deposit_paid" | "paid";
  status: string;
  total: number;
}

const BILLING_KIND_LABELS: Record<string, string> = {
  gouvernement: "gouvernemental",
  representant: "représentant",
  standard: "standard"
};

const BILLING_KIND_LABELS_ADMIN: Record<string, string> = {
  gouvernement: "Gouvernemental",
  representant: "Représentant",
  standard: "Standard"
};

/**
 * Process payment reminders and cancellations
 * This endpoint can be called via cron job or manually
 */
export async function processPaymentReminders(req: Request, res: Response) {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🔔 PAYMENT REMINDERS PROCESSING STARTED");
    console.log("=".repeat(60));
    
    const now = new Date();
    
    // Find unpaid orders for government and representative clients with payment due dates
    const unpaidOrders = await Order.find({
      billingKind: { $in: ["gouvernement", "representant"] },
      paymentStatus: { $in: ["unpaid", "deposit_paid"] },
      paymentDueDate: { $exists: true, $ne: null },
      status: { $nin: ["cancelled", "completed"] }
    }).lean() as unknown as OrderWithBilling[];

    console.log(`📋 Found ${unpaidOrders.length} unpaid orders for government/representative clients`);

    let remindersSentWeek = 0;
    let remindersSent48h = 0;
    let remindersSentOverdue = 0;
    let ordersCancelled = 0;
    let errors = 0;

    for (const order of unpaidOrders) {
      const dueDate = order.paymentDueDate ? new Date(order.paymentDueDate) : null;
      if (!dueDate) continue;
      
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\n📦 Order ${order.orderNumber}:`);
      console.log(`   - Billing type: ${order.billingKind}`);
      console.log(`   - Due date: ${dueDate.toISOString().split('T')[0]}`);
      console.log(`   - Days until due: ${daysUntilDue}`);
      console.log(`   - Status: ${order.paymentStatus}`);

      const fullName = `${order.clientInfo.firstName} ${order.clientInfo.lastName}`;
      const billingKindLabel = BILLING_KIND_LABELS[order.billingKind] || "standard";

      try {
        // Check if order is overdue
        if (daysUntilDue < 0) {
          // Order is overdue - send final reminder
          await sendPaymentOverdueEmail(
            order.clientInfo.email,
            fullName,
            order.orderNumber,
            order.total,
            Math.abs(daysUntilDue),
            billingKindLabel
          );
          remindersSentOverdue++;
          
          // Cancel the order
          await Order.findByIdAndUpdate(order._id, {
            status: "cancelled",
            $push: {
              changeHistory: {
                changedAt: new Date(),
                field: "status",
                oldValue: order.status,
                newValue: "cancelled",
                changeType: "status_changed",
                notes: "Commande annulée automatiquement - paiement en retard"
              }
            }
          });
          
          console.log(`   ⚠️ Order CANCELLED - payment overdue by ${Math.abs(daysUntilDue)} days`);
          ordersCancelled++;
        }
        // Check if 48 hours before due date
        else if (daysUntilDue <= 2 && daysUntilDue > 0) {
          await sendPaymentReminderEmail(
            order.clientInfo.email,
            fullName,
            order.orderNumber,
            order.total,
            daysUntilDue,
            billingKindLabel,
            "48 heures"
          );
          remindersSent48h++;
        }
        // Check if 1 week before due date
        else if (daysUntilDue <= 7 && daysUntilDue > 2) {
          await sendPaymentReminderEmail(
            order.clientInfo.email,
            fullName,
            order.orderNumber,
            order.total,
            daysUntilDue,
            billingKindLabel,
            "une semaine"
          );
          remindersSentWeek++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing order ${order.orderNumber}:`, error);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`📧 Rappels (1 semaine): ${remindersSentWeek}`);
    console.log(`📧 Rappels (48h): ${remindersSent48h}`);
    console.log(`📧 Rappels (en retard): ${remindersSentOverdue}`);
    console.log(`⚠️ Commandes annulées: ${ordersCancelled}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log("=".repeat(60) + "\n");

    res.json({
      success: true,
      message: "Payment reminders processed successfully",
      summary: {
        totalOrders: unpaidOrders.length,
        remindersSentWeek,
        remindersSent48h,
        remindersSentOverdue,
        ordersCancelled,
        errors
      }
    });
  } catch (error) {
    console.error("❌ Error processing payment reminders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment reminders",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Get orders with upcoming payment due dates (for admin preview)
 */
export async function getUpcomingPayments(req: Request, res: Response) {
  try {
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingOrders = await Order.find({
      billingKind: { $in: ["gouvernement", "representant"] },
      paymentStatus: { $in: ["unpaid", "deposit_paid"] },
      paymentDueDate: { 
        $exists: true, 
        $ne: null,
        $gte: now,
        $lte: oneMonthFromNow
      },
      status: { $nin: ["cancelled", "completed"] }
    })
    .select("orderNumber clientInfo billingKind paymentDueDate paymentStatus total status")
    .sort({ paymentDueDate: 1 })
    .lean() as unknown as OrderWithBilling[];

    const overdueOrders = await Order.find({
      billingKind: { $in: ["gouvernement", "representant"] },
      paymentStatus: { $in: ["unpaid", "deposit_paid"] },
      paymentDueDate: { 
        $exists: true, 
        $ne: null,
        $lt: now
      },
      status: { $nin: ["cancelled", "completed"] }
    })
    .select("orderNumber clientInfo billingKind paymentDueDate paymentStatus total status")
    .sort({ paymentDueDate: 1 })
    .lean() as unknown as OrderWithBilling[];

    // Calculate days until due/overdue for each order
    const enrichedUpcoming = upcomingOrders.map(order => {
      const dueDate = order.paymentDueDate ? new Date(order.paymentDueDate) : null;
      const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        ...order,
        daysUntilDue,
        billingTypeLabel: BILLING_KIND_LABELS_ADMIN[order.billingKind] || "Standard"
      };
    });

    const enrichedOverdue = overdueOrders.map((order: OrderWithBilling) => {
      const dueDate = order.paymentDueDate ? new Date(order.paymentDueDate) : null;
      const daysOverdue = dueDate ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        ...order,
        daysOverdue,
        billingTypeLabel: BILLING_KIND_LABELS_ADMIN[order.billingKind] || "Standard"
      };
    });

    res.json({
      success: true,
      data: {
        upcoming: enrichedUpcoming,
        overdue: enrichedOverdue,
        summary: {
          upcomingCount: upcomingOrders.length,
          overdueCount: overdueOrders.length
        }
      }
    });
  } catch (error) {
    console.error("❌ Error getting upcoming payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming payments",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
