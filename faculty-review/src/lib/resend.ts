import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set. Email notifications will be skipped.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "");

export const FROM_EMAIL = "Faculty Review <notifications@facultyreview.in>";
// Replace yourdomain.com with your verified Resend domain
// During testing you can use: onboarding@resend.dev (Resend's test sender)