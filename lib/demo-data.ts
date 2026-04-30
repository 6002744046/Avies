import type { OrderRecord, ProgressPhotoRecord, RefundRequestRecord } from "./types";

export const demoOrders: OrderRecord[] = [
  {
    id: "ord_demo_001",
    plan_type: "subscription",
    amount: 2499,
    status: "Processing",
    razorpay_order_id: "demo",
    created_at: new Date().toISOString()
  },
  {
    id: "ord_demo_002",
    plan_type: "one_time",
    amount: 7499,
    status: "Delivered",
    razorpay_order_id: "demo",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString()
  }
];

export const demoProgress: ProgressPhotoRecord[] = [
  {
    id: "photo_before",
    milestone: "before",
    image_url: "",
    notes: "Baseline uploaded",
    density_score: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
  },
  {
    id: "photo_30",
    milestone: "day_30",
    image_url: "",
    notes: "Shedding stabilized",
    density_score: 51,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
  },
  {
    id: "photo_60",
    milestone: "day_60",
    image_url: "",
    notes: "Baby hair visibility improving",
    density_score: 61,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  }
];

export const demoRefunds: RefundRequestRecord[] = [
  {
    id: "refund_demo_001",
    reason: "No visible improvement after full 90-day routine.",
    status: "Pending",
    created_at: new Date().toISOString()
  }
];
