import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Never pre-render — this route needs runtime env vars
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, fullName, email, phone, interest, message, notes } = body;

    const contactName = (fullName || name || '').trim();
    const contactMessage = (message || notes || '').trim();

    // ── Validation ─────────────────────────────────────────────────────────
    if (!contactName || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
      );
    }
    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }
    if (!contactMessage) {
      return NextResponse.json(
        { success: false, error: 'Please include a message.' },
        { status: 400 }
      );
    }

    // ── Insert into contacts table ──────────────────────────────────────────
    const { error } = await getSupabaseAdmin()
      .from('contacts')
      .insert([
        {
          full_name: contactName,
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
          interest: interest || 'general',
          message: contactMessage,
          source: 'contact_page',
          status: 'new',
        },
      ]);

    if (error) {
      console.error('[contact/route] Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry received. Our team will be in touch shortly.',
    });

  } catch (err) {
    console.error('[contact/route] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
