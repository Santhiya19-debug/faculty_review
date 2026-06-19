import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyAndFulfillRequests } from "@/lib/notify-requesters";
import { createClient as createServerClient } from "@/lib/supabase/server";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      facultyName,
      departmentId,
      strictness,
      internal_marks,
      cat_correction,
      teaching_quality,
      attendance_flexibility,
      student_friendliness,
      content,
    } = body;

    if (!facultyName?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // STEP 1: Check if faculty already exists (case-insensitive)
    const { data: existingFaculties } = await adminClient
      .from("faculties")
      .select("id, name")
      .ilike("name", facultyName.trim())
      .limit(1);

    let facultyId: string;
    let isNewFaculty = false;

    if (existingFaculties && existingFaculties.length > 0) {
      // Faculty already exists — use it
      facultyId = existingFaculties[0].id;
    } else {
      // STEP 2: Faculty doesn't exist — check if it's in faculty_requests
      const { data: matchingRequests } = await adminClient
        .from("faculty_requests")
        .select("id, faculty_name, department_id")
        .ilike("faculty_name", facultyName.trim())
        .eq("status", "pending")
        .limit(1);

      // STEP 3: Create the faculty entry
      const { data: newFaculty, error: createError } = await adminClient
        .from("faculties")
        .insert({
          name: facultyName.trim(),
          department_id: matchingRequests?.[0]?.department_id || departmentId || null,
          overall_rating: 0,
          review_count: 0,
          is_verified: false,
          teaching_quality: 5,
          strictness: 5,
          attendance_flexibility: 5,
          marks_leniency: 5,
        })
        .select("id")
        .single();

      if (createError || !newFaculty) {
        return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 });
      }

      facultyId = newFaculty.id;
      isNewFaculty = true;
    }

    // STEP 4: Check user hasn't already reviewed this faculty
    const { data: existingReview } = await adminClient
      .from("reviews")
      .select("id")
      .eq("faculty_id", facultyId)
      .eq("user_id", user.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this faculty", facultyId },
        { status: 409 }
      );
    }

    // STEP 5: Insert the review
    const { error: reviewError } = await adminClient.from("reviews").insert({
      faculty_id: facultyId,
      user_id: user.id,
      title: content.trim().slice(0, 80),
      content: content.trim(),
      strictness,
      internal_marks,
      cat_correction,
      teaching_quality,
      attendance_flexibility,
      student_friendliness,
    });

    if (reviewError) {
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    // STEP 6: If faculty was just created, notify requesters + mark fulfilled
    if (isNewFaculty) {
      await notifyAndFulfillRequests(facultyName.trim(), facultyId);
    }

    return NextResponse.json({ ok: true, facultyId, isNewFaculty });
  } catch (err) {
    console.error("submit-review error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}