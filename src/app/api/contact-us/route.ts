import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const message = formData.get("message");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const privacyPolicy = formData.get("privacyPolicy")
    ? formData.get("privacyPolicy") === "on"
    : false;

  if (!message || !firstName || !lastName || !email || !phone) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 422 }
    );
  }

  const form = {
    formName: "Contact Form",
    formData: {
      message,
      firstName,
      lastName,
      email,
      phone,
      privacyPolicy,
    },
  };

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
    },
    body: JSON.stringify(form),
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/report-forms`,
    opts
  );
  const data = await res.json();

  return NextResponse.json({ message: "Success!", data }, { status: 200 });
}
