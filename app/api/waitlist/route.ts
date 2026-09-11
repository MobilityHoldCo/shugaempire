import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, city, role, notes } = body;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!fullName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name and email are required.' },
        { status: 400 }
      );
    }
    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // ── Check for duplicate email ───────────────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from('waitlist')
      .select('id, position')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        position: existing.position,
        message: 'You are already on the waitlist!',
      });
    }

    // ── Get current count to assign a position ─────────────────────────────
    const { count } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const position = (count ?? 0) + 1420; // start queue at 1420

    // ── Insert record ───────────────────────────────────────────────────────
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert([
        {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
          city: city || 'Lagos',
          role: role || 'Driver',
          notes: notes?.trim() || null,
          position,
          source: 'website_waitlist',
          status: 'pending',
        },
      ])
      .select('id, position')
      .single();

    if (error) {
      console.error('[waitlist/route] Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      position: data.position,
      message: 'Successfully added to the waitlist.',
    });

  } catch (err) {
    console.error('[waitlist/route] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Returns the current waitlist count (public, safe)
  try {
    const { count, error } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({ count: (count ?? 0) + 1420 });
  } catch {
    return NextResponse.json({ count: 1420 });
  }
}
