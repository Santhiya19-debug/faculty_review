import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyAndFulfillRequests } from "@/lib/notify-requesters";
import { createClient as createServerClient } from "@/lib/supabase/server";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    const [
      authResult,
      body,
    ] = await Promise.all([
      supabase.auth.getUser(),
      req.json(),
    ]);

    const user = authResult.data.user;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const trimmedFacultyName = facultyName?.trim();
    const trimmedContent = content?.trim();

    if (!trimmedFacultyName || !trimmedContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Check faculty
    const { data: existingFaculty } = await adminClient
      .from("faculties")
      .select("id, name")
      .ilike("name", trimmedFacultyName)
      .maybeSingle();

    let facultyId: string;
    let isNewFaculty = false;

    if (existingFaculty) {
      facultyId = existingFaculty.id;
    } else {
      const { data: matchingRequest } = await adminClient
        .from("faculty_requests")
        .select("department_id")
        .ilike("faculty_name", trimmedFacultyName)
        .eq("status", "pending")
        .maybeSingle();

      const { data: newFaculty, error: createError } = await adminClient
        .from("faculties")
        .insert({
          name: trimmedFacultyName,
          department_id:
            matchingRequest?.department_id || departmentId || null,
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
        console.error(createError);
        return NextResponse.json(
          { error: "Failed to create faculty" },
          { status: 500 }
        );
      }

      facultyId = newFaculty.id;
      isNewFaculty = true;
    }

    // Step 2: Prevent duplicate review
    const { data: existingReview } = await adminClient
      .from("reviews")
      .select("id")
      .eq("faculty_id", facultyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        {
          error: "You have already reviewed this faculty",
          facultyId,
        },
        { status: 409 }
      );
    }

    // Step 3: Insert review
    const { error: reviewError } = await adminClient
      .from("reviews")
      .insert({
        faculty_id: facultyId,
        user_id: user.id,
        title: trimmedContent.slice(0, 80),
        content: trimmedContent,
        strictness,
        internal_marks,
        cat_correction,
        teaching_quality,
        attendance_flexibility,
        student_friendliness,
      });

    if (reviewError) {
      console.error(reviewError);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    // Step 4: Background notification (non-blocking)
    if (isNewFaculty) {
      notifyAndFulfillRequests(trimmedFacultyName, facultyId)
        .catch((err) => {
          console.error("Background notify failed:", err);
        });
    }

    return NextResponse.json({
      ok: true,
      facultyId,
      isNewFaculty,
    });
  } catch (err) {
    console.error("submit-review error:", err);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}