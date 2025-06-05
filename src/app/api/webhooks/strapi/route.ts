// src/app/api/webhooks/strapi/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  revalidateLayout,
  revalidateGames,
  revalidateGame,
  clearAllCaches,
} from "@/app/actions/cache";

// Webhook secret from Strapi
const WEBHOOK_SECRET = process.env.STRAPI_WEBHOOK_SECRET || "";

/**
 * Verify webhook signature from Strapi
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature || !WEBHOOK_SECRET) return false;

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle Strapi webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-strapi-signature");

    // Verify webhook signature
    if (WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const { event, model, entry } = payload;

    console.log(`Webhook received: ${event} on ${model}`);

    // Handle different model updates
    switch (model) {
      case "layout":
        await revalidateLayout();
        break;

      case "main-navigation":
        await revalidateLayout();
        break;

      case "translation":
        await revalidateLayout();
        break;

      case "game":
        // Revalidate specific game if updating/deleting
        if (
          (event === "entry.update" || event === "entry.delete") &&
          entry?.slug
        ) {
          await revalidateGame(entry.slug);
        }
        // Always revalidate games list
        await revalidateGames();
        break;

      case "casino":
        // Handle casino updates
        if (entry?.slug) {
          await revalidateByPath(`/casinos/${entry.slug}`);
        }
        await revalidateByPath("/casinos");
        break;

      case "blog":
      case "article":
        // Handle blog updates
        if (entry?.slug) {
          await revalidateByPath(`/blog/${entry.slug}`);
        }
        await revalidateByPath("/blog");
        break;

      default:
        console.log(`Unhandled model: ${model}`);
    }

    // For create/delete events on any model, clear layout cache
    // as counts or navigation might have changed
    if (event === "entry.create" || event === "entry.delete") {
      await revalidateLayout();
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${event} for ${model}`,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    webhook: "strapi",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle other methods
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// Type for Strapi webhook payload
interface StrapiWebhookPayload {
  event:
    | "entry.create"
    | "entry.update"
    | "entry.delete"
    | "entry.publish"
    | "entry.unpublish";
  createdAt: string;
  model: string;
  entry: {
    id: number;
    slug?: string;
    [key: string]: any;
  };
  user?: {
    id: number;
    email: string;
  };
}

// Helper function to revalidate by path (import from cache actions)
async function revalidateByPath(path: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath(path);
}
