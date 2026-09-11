import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Never pre-render — dynamic runtime API
export const dynamic = 'force-dynamic';

const ADMIN_PASSCODE = 'ShugaAdmin2026!';

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || '';
  const urlKey = req.nextUrl.searchParams.get('key') || '';
  if (authHeader.startsWith('Bearer ') && authHeader.substring(7) === ADMIN_PASSCODE) {
    return true;
  }
  if (urlKey === ADMIN_PASSCODE) {
    return true;
  }
  return false;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * GET /api/admin/leads
 * Strictly fetches real records from Supabase: waitlist + contacts
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid Admin Passcode' },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch waitlist applicants
    const { data: waitlistData, error: waitlistError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (waitlistError) {
      console.error('[admin/leads] Waitlist fetch error:', waitlistError);
    }

    // 2. Fetch contact enquiries
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactsError) {
      console.error('[admin/leads] Contacts fetch error:', contactsError);
    }

    // 3. Normalize into unified lead format
    const leads: any[] = [];

    (waitlistData || []).forEach((w: any) => {
      leads.push({
        id: w.id,
        table: 'waitlist',
        timestamp: w.created_at ? w.created_at.replace('T', ' ').substring(0, 19) : '',
        fullName: w.full_name || '',
        email: w.email || '',
        phone: w.phone || '',
        city: w.city || 'Lagos',
        role: w.role || 'Driver',
        notes: w.notes || '',
        position: w.position,
        status: w.status ? w.status.charAt(0).toUpperCase() + w.status.slice(1) : 'New',
        source: w.source || 'website_waitlist',
      });
    });

    (contactsData || []).forEach((c: any) => {
      const interest = c.interest ? c.interest.charAt(0).toUpperCase() + c.interest.slice(1) : 'General';
      leads.push({
        id: c.id,
        table: 'contacts',
        timestamp: c.created_at ? c.created_at.replace('T', ' ').substring(0, 19) : '',
        fullName: c.full_name || '',
        email: c.email || '',
        phone: c.phone || '',
        city: 'Nigeria',
        role: `Contact (${interest})`,
        notes: c.message || '',
        status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'New',
        source: c.source || 'contact_page',
      });
    });

    // Sort newest first
    leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(
      {
        success: true,
        count: leads.length,
        data: leads,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[admin/leads] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/admin/leads
 * Permanently deletes a record directly from Supabase (by ID or Email)
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    let id = req.nextUrl.searchParams.get('id') || '';
    let email = req.nextUrl.searchParams.get('email') || '';
    let table = req.nextUrl.searchParams.get('table') || '';

    // Also parse JSON body if passed in request body
    try {
      const body = await req.json();
      if (body.id) id = body.id;
      if (body.email) email = body.email;
      if (body.table) table = body.table;
    } catch {
      // Body may be empty in query-string DELETE
    }

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'Record ID or Email required for deletion' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = getSupabaseAdmin();
    let deletedCount = 0;

    // If table specified, delete from that table; otherwise check both
    if (table === 'waitlist' || !table) {
      if (id) {
        const { error } = await supabase.from('waitlist').delete().eq('id', id);
        if (!error) deletedCount++;
      }
      if (email) {
        const { error } = await supabase.from('waitlist').delete().eq('email', email.trim().toLowerCase());
        if (!error) deletedCount++;
      }
    }

    if (table === 'contacts' || !table) {
      if (id) {
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (!error) deletedCount++;
      }
      if (email) {
        const { error } = await supabase.from('contacts').delete().eq('email', email.trim().toLowerCase());
        if (!error) deletedCount++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Record permanently deleted from Supabase',
        deletedCount,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[admin/leads] Delete error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Delete error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PATCH /api/admin/leads
 * Permanently updates a record status directly in Supabase
 */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    const { id, status, table, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = getSupabaseAdmin();
    const normalizedStatus = status.toLowerCase();

    if (table === 'contacts') {
      const updateData: any = { status: normalizedStatus };
      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
      const { error } = await supabase.from('contacts').update(updateData).eq('id', id);
      if (error) throw error;
    } else {
      // Default to waitlist
      const updateData: any = { status: normalizedStatus };
      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
      const { error } = await supabase.from('waitlist').update(updateData).eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Status updated permanently in Supabase',
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[admin/leads] Patch error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Update error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
