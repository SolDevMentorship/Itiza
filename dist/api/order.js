"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("./supabaseClient");
const crypto_1 = require("crypto");
const nodemailer_1 = __importDefault(require("nodemailer"));
const ALLOWED_ORDER_KEYS = [
    "trackingID",
    "customerID",
    "merchantID",
    "giftID",
    "paymentMethod",
    "amount",
    "networkFee",
    "recipientName",
    "recipientStreet",
    "recipientCity",
    "recipientState",
    "recipientCountry",
    "giftMessage",
    "quantity",
    "gift",
    "status",
    "recipientPhone",
    "senderWallet",
];
function maskPII(obj) {
    if (!obj || typeof obj !== "object")
        return obj;
    const copy = { ...obj };
    if (copy.email && typeof copy.email === "string") {
        const parts = copy.email.split("@");
        copy.email = parts.length === 2 ? `${parts[0][0]}***@${parts[1]}` : "***";
    }
    if (copy.phone || copy.phonenumber || copy.recipientPhone) {
        if (copy.phone)
            copy.phone = copy.phone.replace(/\d(?=\d{3})/g, "*");
        if (copy.phonenumber)
            copy.phonenumber = copy.phonenumber.replace(/\d(?=\d{3})/g, "*");
        if (copy.recipientPhone)
            copy.recipientPhone = copy.recipientPhone.replace(/\d(?=\d{3})/g, "*");
    }
    return copy;
}
// Nodemailer setup using Gmail app password
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
// Verify transporter at module load (debug)
transporter
    .verify()
    .then(() => {
    console.log("[DEBUG orders] Nodemailer transporter verified and ready");
})
    .catch((err) => {
    console.warn("[DEBUG orders] Nodemailer transporter verification failed:", err?.message ?? err);
});
/**
 * Try to resolve a gift image into either a public URL or a Buffer (download).
 */
async function resolveGiftImage(supabase, g) {
    const candidate = (g.img ?? g.imageUrl);
    if (!candidate)
        return {};
    if (typeof candidate === "string" && (candidate.startsWith("http://") || candidate.startsWith("https://"))) {
        return { publicUrl: candidate };
    }
    const buckets = ["gifts", "gift-images"];
    for (const bucket of buckets) {
        try {
            const { data: downloaded, error: dlErr } = await supabase.storage.from(bucket).download(candidate);
            if (!dlErr && downloaded) {
                try {
                    // @ts-ignore
                    const arrayBuffer = await downloaded.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    return { buffer };
                }
                catch (e) {
                    try {
                        // @ts-ignore
                        if (Buffer.isBuffer(downloaded))
                            return { buffer: downloaded };
                    }
                    catch { }
                }
            }
        }
        catch (e) {
            // ignore and try next
        }
        try {
            const maybe = supabase.storage.from(bucket).getPublicUrl(candidate) || {};
            const publicURL = (maybe.data && (maybe.data.publicUrl ?? maybe.data.publicURL)) ?? maybe.publicUrl ?? maybe.publicURL ?? null;
            if (publicURL)
                return { publicUrl: publicURL };
        }
        catch (e) {
            // ignore
        }
    }
    return {};
}
function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
}
/**
 * Send customer email (warm & friendly)
 */
async function sendOrderEmail(options) {
    const { to, fullName, order, gift } = options;
    const trackingID = order.trackingID ?? "-";
    const merchantID = order.merchantID ?? "-";
    const giftName = (gift && (gift.name || gift.title || order.gift)) || order.gift || "Item";
    const price = typeof order.amount === "number" ? order.amount : Number(order.amount || 0);
    const quantity = order.quantity ?? 1;
    const paymentMethod = order.paymentMethod ?? "-";
    const giftId = gift?.id ?? order.giftID ?? null;
    const subject = `Payment Confirmation & Order Update — Ref ${trackingID}`;
    const intro = `
    <strong>Hello ${escapeHtml(fullName)},</strong>
    <p style="margin:8px 0 0 0">We’re delighted to confirm your payment — thank you for choosing Itiza. Below are the details of your transaction.</p>
  `;
    const iconCheck = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:6px"><path d="M20 6L9 17l-5-5" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const orderTableRow = `
    <tr>
      <td style="padding:10px;border:1px solid #eee">${escapeHtml(String(merchantID))}</td>
      <td style="padding:10px;border:1px solid #eee">${escapeHtml(String(trackingID))}</td>
      <td style="padding:10px;border:1px solid #eee">${escapeHtml(String(giftName))}</td>
      <td style="padding:10px;border:1px solid #eee">$ ${price.toFixed(2)}</td>
      <td style="padding:10px;border:1px solid #eee">${escapeHtml(String(quantity))}</td>
      <td style="padding:10px;border:1px solid #eee">${escapeHtml(String(paymentMethod))}</td>
    </tr>
  `;
    const attachments = [];
    let inlineImgHtml = "";
    if (gift) {
        const cid = giftId ? `gift_${giftId}` : `gift_${Date.now()}`;
        if (gift.resolvedBuffer && Buffer.isBuffer(gift.resolvedBuffer)) {
            attachments.push({
                filename: `gift-${giftId ?? "img"}.jpg`,
                content: gift.resolvedBuffer,
                cid,
            });
            inlineImgHtml = `<div style="margin-top:12px;text-align:center"><img src="cid:${cid}" alt="${escapeHtml(giftName)}" style="max-width:240px;height:auto;border-radius:8px;border:1px solid #f0f0f0;"/></div>`;
        }
        else if (gift.resolvedImg) {
            inlineImgHtml = `<div style="margin-top:12px;text-align:center"><img src="${escapeHtml(gift.resolvedImg)}" alt="${escapeHtml(giftName)}" style="max-width:240px;height:auto;border-radius:8px;border:1px solid #f0f0f0;"/></div>`;
        }
    }
    const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111; line-height:1.5; max-width:700px">
      <div style="background:#fff;border-radius:10px;padding:20px;border:1px solid #f3f4f6">
        ${intro}

        <h4 style="margin-top:18px;margin-bottom:8px;color:#0f172a">${iconCheck}Transaction Summary</h4>

        <table role="presentation" style="width:100%;border-collapse:collapse;background:#ffffff;margin-top:8px">
          <thead>
            <tr>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #f3f4f6;color:#374151">Merchant</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #f3f4f6;color:#374151">Reference</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #f3f4f6;color:#374151">Item</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #f3f4f6;color:#374151">Amount</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #f3f4f6;color:#374151">Quantity</th>
              <th style="text-align:left;padding:10px;border-bottom:2px solid #f3f4f6;color:#374151">Payment</th>
            </tr>
          </thead>
          <tbody>
            ${orderTableRow}
          </tbody>
        </table>

        ${inlineImgHtml}

        <p style="margin-top:14px;color:#334155">If you have any questions, please <a href="https://itiza.co/contact">contact us</a> or email <a href="mailto:itiza.co@gmail.com">itiza.co@gmail.com</a>. For faster service, include your reference number <strong>${escapeHtml(trackingID)}</strong>.</p>

        <h4 style="margin-top:18px;margin-bottom:8px;color:#0f172a">Order Confirmation</h4>
        <p style="margin:0;color:#475569">Your order <strong>${escapeHtml(trackingID)}</strong> has been confirmed. We’ll pack and ship it as soon as possible and notify you when it’s ready for collection or out for delivery.</p>

        <p style="margin-top:20px;color:#111"><strong>Warm regards,</strong><br/>The Itiza Team</p>
      </div>
    </div>
  `;
    const text = `Hello ${fullName},

We confirm receipt of your payment.

Merchant: ${merchantID}
Reference: ${trackingID}
Item: ${giftName}
Amount: $${price.toFixed(2)}
Quantity: ${quantity}
Payment Method: ${paymentMethod}

If you have questions contact itiza.co@gmail.com (include reference ${trackingID}).

Order ${trackingID} confirmed — we will notify you when it ships.

Warm regards,
The Itiza Team
  `;
    const mailOptions = {
        from: process.env.FROM_EMAIL || `Itiza <noreply@itiza.co>`,
        to,
        subject,
        text,
        html,
    };
    if (attachments.length > 0)
        mailOptions.attachments = attachments;
    // Debug log just before sending customer email
    console.log("[DEBUG orders] Sending customer email:", { to, subject });
    const info = await transporter.sendMail(mailOptions);
    // Debug log after sending
    console.log("[DEBUG orders] sendMail result for customer:", {
        to,
        messageId: info?.messageId,
        response: info?.response,
    });
    return info;
}
/**
 * Send merchant notification (official tone)
 */
async function sendMerchantNotification(options) {
    const { to, businessName, order, gift } = options;
    const trackingID = order.trackingID ?? "-";
    const giftName = (gift && (gift.name || gift.title || order.gift)) || order.gift || "Item";
    const giftId = gift?.id ?? order.giftID ?? null;
    const recipientName = order.recipientName ?? "-";
    const recipientStreet = order.recipientStreet ?? "-";
    const recipientCity = order.recipientCity ?? "-";
    const recipientState = order.recipientState ?? "-";
    const recipientCountry = order.recipientCountry ?? "-";
    const quantity = order.quantity ?? 1;
    const giftMessage = order.giftMessage ?? "";
    const recipientPhone = order.recipientPhone ?? "-";
    const subject = `New Order Received — ${trackingID}`;
    const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color:#111; max-width:700px; line-height:1.5">
      <div style="background:#fff;border-radius:10px;padding:20px;border:1px solid #e6e6e6">
        <h2 style="margin:0 0 8px 0;color:#0f172a">Order Notification</h2>
        <p style="margin:0 0 12px 0;color:#374151">Dear ${escapeHtml(businessName ?? "Merchant")},</p>

        <p style="margin:0 0 12px 0;color:#374151">
          We have received a purchase for your product. Please find the delivery details below:
        </p>

        <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:8px">
          <tbody>
            <tr><td style="padding:8px;border-top:1px solid #f3f4f6;font-weight:600">Tracking ID</td><td style="padding:8px;border-top:1px solid #f3f4f6">${escapeHtml(trackingID)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Gift</td><td style="padding:8px">${escapeHtml(giftName)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Gift ID</td><td style="padding:8px">${escapeHtml(String(giftId))}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Quantity</td><td style="padding:8px">${escapeHtml(String(quantity))}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Recipient</td><td style="padding:8px">${escapeHtml(recipientName)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Phone</td><td style="padding:8px">${escapeHtml(recipientPhone)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Street</td><td style="padding:8px">${escapeHtml(recipientStreet)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">City</td><td style="padding:8px">${escapeHtml(recipientCity)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">State</td><td style="padding:8px">${escapeHtml(recipientState)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Country</td><td style="padding:8px">${escapeHtml(recipientCountry)}</td></tr>
            <tr><td style="padding:8px;font-weight:600">Gift Message</td><td style="padding:8px">${escapeHtml(giftMessage)}</td></tr>
          </tbody>
        </table>

        <p style="margin-top:12px;color:#374151">
          Please ensure delivery to the recipient within the next <strong>5 working days</strong> to help secure a favorable rating and good customer experience.
        </p>

        <p style="margin-top:12px;color:#374151">
          If you need assistance, reply to this email or contact our merchant support at <a href="mailto:itiza.co@gmail.com">itiza.co@gmail.com</a>.
        </p>

        <p style="margin-top:18px;color:#111"><strong>Regards,</strong><br/>Itiza Merchant Operations</p>
      </div>
    </div>
  `;
    const text = `Merchant: ${businessName ?? "Merchant"}

An order has been placed.

Tracking ID: ${trackingID}
Gift: ${giftName}
Gift ID: ${giftId}
Quantity: ${quantity}
Recipient: ${recipientName}
Phone: ${recipientPhone}
Street: ${recipientStreet}
City: ${recipientCity}
State: ${recipientState}
Country: ${recipientCountry}
Gift Message: ${giftMessage}

Please deliver within 5 working days to receive a good rating.

Contact: itiza.co@gmail.com
`;
    const mailOptions = {
        from: process.env.FROM_EMAIL || `Itiza <noreply@itiza.co>`,
        to,
        subject,
        text,
        html,
    };
    // Debug: show mail target and short payload (no sensitive data)
    console.log("[DEBUG orders] sendMerchantNotification mailOptions:", {
        to,
        subject,
        trackingID,
        recipientName,
        recipientCity,
        recipientState,
        recipientCountry,
        quantity,
    });
    const info = await transporter.sendMail(mailOptions);
    console.log("[DEBUG orders] sendMail result for merchant:", {
        to,
        messageId: info?.messageId,
        response: info?.response,
    });
    return info;
}
/**
 * Vercel Node handler for POST /Itiza_Delivery/orders
 * - Replaces express router with a single handler
 * - Adds CORS headers + preflight handling
 * - Preserves all existing Supabase logic and helper functions unchanged
 */
async function handler(req, res) {
    // Basic CORS - allow origins via env or fallback to wildcard
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
        .split(",")
        .map((s) => s.trim());
    const origin = String(req.headers.origin || "");
    const allowOriginHeader = allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins.includes("*")
            ? "*"
            : "";
    if (allowOriginHeader) {
        res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
        if (allowOriginHeader !== "*") {
            res.setHeader("Access-Control-Allow-Credentials", "true");
        }
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400"); // cache preflight for 1 day
    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }
    try {
        console.log("🔔 /Itiza_Delivery/orders incoming headers:", {
            host: req.headers.host,
            origin: req.headers.origin,
            "content-type": req.headers["content-type"],
            ua: req.headers["user-agent"],
        });
        const body = req.body;
        if (!body) {
            return res.status(400).json({ success: false, error: "Request body is empty" });
        }
        const rawRows = Array.isArray(body) ? body : [body];
        const validationErrors = [];
        const cleanRows = rawRows.map((r, idx) => {
            if (r.amount != null && typeof r.amount !== "number") {
                validationErrors.push(`row ${idx}: amount must be a number if provided`);
            }
            if (r.quantity != null && typeof r.quantity !== "number") {
                validationErrors.push(`row ${idx}: quantity must be a number if provided`);
            }
            if (r.giftID != null && typeof r.giftID !== "number") {
                validationErrors.push(`row ${idx}: giftID must be a number if provided`);
            }
            if (!r.customerID) {
                validationErrors.push(`row ${idx}: customerID is required`);
            }
            const picked = {};
            for (const key of ALLOWED_ORDER_KEYS) {
                if (r[key] !== undefined)
                    picked[key] = r[key];
            }
            if (!picked.trackingID)
                picked.trackingID = (0, crypto_1.randomUUID)();
            return picked;
        });
        if (validationErrors.length > 0) {
            console.warn("Validation errors on incoming orders:", validationErrors);
            return res.status(400).json({ success: false, error: "Validation failed", details: validationErrors });
        }
        console.log("🔔 /Itiza_Delivery/orders sanitized incoming body:", JSON.stringify(rawRows.map(maskPII), null, 2));
        const supabase = (0, supabaseClient_1.getSupabase)();
        // Insert orders
        const { data: insertedOrders, error: insertError } = await supabase.from("orders").insert(cleanRows).select();
        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return res.status(502).json({ success: false, error: "Database insert failed", details: insertError });
        }
        if (!insertedOrders || insertedOrders.length === 0) {
            console.warn("No rows returned from insert.");
            return res.status(500).json({ success: false, error: "Insert succeeded but no rows returned" });
        }
        console.log(`[orders] inserted ${insertedOrders.length} row(s)`);
        const customerAgg = new Map();
        const customerIdsSet = new Set();
        const giftIdsSet = new Set();
        const merchantIdsSet = new Set();
        for (const ord of insertedOrders) {
            const cid = ord.customerID ?? "";
            if (!cid)
                continue;
            customerIdsSet.add(cid);
            if (ord.giftID != null)
                giftIdsSet.add(Number(ord.giftID));
            if (ord.merchantID) {
                // DO NOT normalize merchantID - keep case-sensitivity
                merchantIdsSet.add(String(ord.merchantID));
            }
            let amt = 0;
            if (ord.amount == null)
                amt = 0;
            else if (typeof ord.amount === "number")
                amt = ord.amount;
            else if (typeof ord.amount === "string") {
                const parsed = parseFloat(ord.amount);
                amt = Number.isFinite(parsed) ? parsed : 0;
            }
            else
                amt = Number(ord.amount) || 0;
            const agg = customerAgg.get(cid) ?? { count: 0, sum: 0 };
            agg.count += 1;
            agg.sum += amt;
            customerAgg.set(cid, agg);
        }
        // Fetch customers
        const customerIDs = Array.from(customerIdsSet);
        const customersMap = new Map();
        if (customerIDs.length > 0) {
            const { data: customersData, error: customersErr } = await supabase
                .from("customers")
                .select("id, customerID, fullName, totalOrders, totalSpent")
                .in("customerID", customerIDs);
            if (customersErr) {
                console.error("Error fetching customers:", customersErr);
            }
            else if (customersData) {
                for (const c of customersData) {
                    customersMap.set(c.customerID, c);
                }
            }
        }
        // Fetch gifts and resolve images
        const giftIds = Array.from(giftIdsSet);
        const giftsMap = new Map();
        if (giftIds.length > 0) {
            const { data: giftsData, error: giftsErr } = await supabase
                .from("gifts")
                .select("id, name, title, img, imageUrl, description")
                .in("id", giftIds);
            if (giftsErr) {
                console.error("Error fetching gifts:", giftsErr);
            }
            else if (giftsData) {
                for (const gRaw of giftsData) {
                    const g = gRaw;
                    try {
                        const { publicUrl, buffer } = await resolveGiftImage(supabase, g);
                        g.resolvedImg = publicUrl ?? null;
                        g.resolvedBuffer = buffer ?? null;
                    }
                    catch (e) {
                        console.error("Error resolving gift image:", e);
                        g.resolvedImg = g.img ?? g.imageUrl ?? null;
                        g.resolvedBuffer = null;
                    }
                    giftsMap.set(g.id, g);
                }
            }
        }
        // Update customer totals
        const updatedCustomers = [];
        for (const [customerID, { count, sum }] of customerAgg.entries()) {
            try {
                const customerRow = customersMap.get(customerID);
                if (!customerRow) {
                    console.warn(`Customer not found for customerID=${customerID}; skipping totals update.`);
                    continue;
                }
                const currentOrders = typeof customerRow.totalOrders === "number" ? customerRow.totalOrders : Number(customerRow.totalOrders) || 0;
                const currentSpent = typeof customerRow.totalSpent === "number" ? customerRow.totalSpent : parseFloat(String(customerRow.totalSpent || "0")) || 0;
                const newTotalOrders = currentOrders + count;
                const newTotalSpent = Number((currentSpent + sum).toFixed(2));
                const { data: updated, error: updateErr } = await supabase
                    .from("customers")
                    .update({ totalOrders: newTotalOrders, totalSpent: newTotalSpent })
                    .eq("customerID", customerID)
                    .select();
                if (updateErr) {
                    console.error(`Error updating customer ${customerID}:`, updateErr);
                    continue;
                }
                if (updated && updated.length > 0) {
                    updatedCustomers.push(updated[0]);
                }
                else if (updated) {
                    updatedCustomers.push(updated);
                }
            }
            catch (uErr) {
                console.error("Unexpected error updating customer totals:", uErr);
            }
        }
        // Fetch merchants by merchantID (case-sensitive)
        const merchantIDs = Array.from(merchantIdsSet);
        const merchantsMap = new Map();
        // DEBUG: show merchantIDs requested
        console.log("[DEBUG orders] merchantIDs requested:", merchantIDs);
        if (merchantIDs.length > 0) {
            const { data: merchantsData, error: merchantsErr } = await supabase
                .from("merchants")
                .select("id, merchantID, businessName, email")
                .in("merchantID", merchantIDs);
            if (merchantsErr) {
                console.error("[DEBUG orders] Error fetching merchants:", merchantsErr);
            }
            else if (merchantsData) {
                // DEBUG: show merchantsData returned
                console.log("[DEBUG orders] merchantsData returned:", merchantsData.map((m) => ({ merchantID: m.merchantID, email: m.email, businessName: m.businessName })));
                for (const m of merchantsData) {
                    // keep exact key (case-sensitive)
                    merchantsMap.set(String(m.merchantID), m);
                }
            }
            else {
                console.log("[DEBUG orders] merchantsData empty or undefined");
            }
        }
        else {
            console.log("[DEBUG orders] No merchantIDs to fetch");
        }
        // Send emails: customers + merchants
        const toneQuery = req.query.tone || "friendly";
        const tone = toneQuery === "formal" ? "formal" : "friendly";
        const sendPromises = insertedOrders.map(async (ord) => {
            const results = { order: ord, customerEmail: null, merchantEmail: null };
            try {
                const customerEmail = ord.customerID;
                const customerRow = customersMap.get(customerEmail);
                const fullName = (customerRow && (customerRow.fullName || customerRow.fullname || customerRow.name)) || "Customer";
                const gift = ord.giftID != null ? giftsMap.get(Number(ord.giftID)) : undefined;
                // send customer email
                if (customerEmail) {
                    try {
                        const info = await sendOrderEmail({
                            to: customerEmail,
                            fullName,
                            order: ord,
                            gift,
                            tone,
                        });
                        console.log(`[DEBUG orders] Customer email sent for order ${ord.trackingID} -> ${customerEmail}`, { messageId: info?.messageId });
                        results.customerEmail = { ok: true, info };
                    }
                    catch (e) {
                        console.error("[DEBUG orders] Error sending customer email for order:", ord.trackingID, e);
                        results.customerEmail = { ok: false, error: e };
                    }
                }
                else {
                    console.warn(`[DEBUG orders] Skipping customer email for order ${ord.trackingID} because customerEmail missing.`);
                }
                // send merchant email (use exact, case-sensitive merchantID)
                const merchantID = ord.merchantID;
                if (merchantID) {
                    const merchantRow = merchantsMap.get(String(merchantID));
                    if (!merchantRow || !merchantRow.email) {
                        console.warn(`[DEBUG orders] Merchant email not found for merchantID=${merchantID} (order ${ord.trackingID}). Skipping merchant notification.`);
                        results.merchantEmail = { ok: false, reason: "merchant-not-found-or-no-email" };
                    }
                    else {
                        try {
                            // Debug: merchant row about to be used
                            console.log("[DEBUG orders] Merchant row used:", { merchantID: merchantRow.merchantID, email: merchantRow.email, businessName: merchantRow.businessName });
                            const merchantInfo = await sendMerchantNotification({
                                to: merchantRow.email,
                                businessName: merchantRow.businessName,
                                order: ord,
                                gift,
                            });
                            console.log(`[DEBUG orders] Merchant email sent for order ${ord.trackingID} -> ${merchantRow.email}`, { messageId: merchantInfo?.messageId });
                            results.merchantEmail = { ok: true, info: merchantInfo };
                        }
                        catch (me) {
                            console.error(`[DEBUG orders] Error sending merchant email for order ${ord.trackingID} to merchantID=${merchantID}`, (me && typeof me === "object" && "message" in me ? me.message : me));
                            results.merchantEmail = { ok: false, error: me };
                        }
                    }
                }
                else {
                    console.warn(`[DEBUG orders] Order ${ord.trackingID} has no merchantID; skipping merchant notification.`);
                    results.merchantEmail = { ok: false, reason: "no-merchantID" };
                }
                return results;
            }
            catch (e) {
                console.error("[DEBUG orders] Unexpected error while processing email for order:", ord.trackingID, e);
                return { ok: false, order: ord, error: e };
            }
        });
        const emailResults = await Promise.allSettled(sendPromises);
        return res.status(201).json({
            success: true,
            inserted: insertedOrders,
            updatedCustomers,
            emailResults,
        });
    }
    catch (err) {
        console.error("Unexpected error in /Itiza_Delivery/orders:", err);
        return res.status(500).json({ success: false, error: err?.message ?? String(err) });
    }
}
exports.default = handler;
//# sourceMappingURL=order.js.map