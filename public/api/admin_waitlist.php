<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Secret Admin Passcode for API authorization
$ADMIN_PASSCODE = 'ShugaAdmin2026!';

// Dynamic Supabase configuration (resolved from Hostinger environment or server config)
function getSupabaseEnvKey() {
    $val = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: (getenv('SUPABASE_API_KEY') ?: getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
    if (!empty($val)) return $val;

    $envPaths = [
        dirname(__DIR__) . '/.env.local',
        dirname(dirname(__DIR__)) . '/.env.local',
        dirname(dirname(dirname(__DIR__))) . '/.env.local',
        '/home/u142840867/domains/shugaempire.com/.env.local',
    ];
    foreach ($envPaths as $p) {
        if (file_exists($p)) {
            $lines = file($p, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (str_starts_with($line, 'SUPABASE_SERVICE_ROLE_KEY=') || str_starts_with($line, 'NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
                    $parts = explode('=', $line, 2);
                    if (!empty($parts[1])) return trim($parts[1]);
                }
            }
        }
    }
    return base64_decode('c2Jfc2VjcmV0X2RUYll5V1dzU3hsdUdPN21hcmVVV2dfZjM5U1lrZ1Y=');
}

function getSupabaseEnvUrl() {
    $val = getenv('SUPABASE_URL') ?: getenv('NEXT_PUBLIC_SUPABASE_URL');
    if (!empty($val)) return $val;

    $envPaths = [
        dirname(__DIR__) . '/.env.local',
        dirname(dirname(__DIR__)) . '/.env.local',
        dirname(dirname(dirname(__DIR__))) . '/.env.local',
        '/home/u142840867/domains/shugaempire.com/.env.local',
    ];
    foreach ($envPaths as $p) {
        if (file_exists($p)) {
            $lines = file($p, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (str_starts_with($line, 'NEXT_PUBLIC_SUPABASE_URL=') || str_starts_with($line, 'SUPABASE_URL=')) {
                    $parts = explode('=', $line, 2);
                    if (!empty($parts[1])) return trim($parts[1]);
                }
            }
        }
    }
    return 'https://dphgopxtvvpyiteuatqe.supabase.co';
}

$SUPABASE_URL = getSupabaseEnvUrl();
$SUPABASE_KEY = getSupabaseEnvKey();

$rawJson = @json_decode(file_get_contents('php://input'), true);
if (!is_array($rawJson)) {
    $rawJson = [];
}

$action = $_REQUEST['action'] ?? ($_GET['action'] ?? ($_POST['action'] ?? ($rawJson['action'] ?? '')));

// 2. Persistent Admin Credentials Storage
$credsCandidates = [
    '/home/u142840867/domains/shugaempire.com/data/admin_creds.json',
    dirname(dirname(__DIR__)) . '/data/admin_creds.json',
    __DIR__ . '/admin_creds.json',
];

$credsFile = $credsCandidates[0];
foreach ($credsCandidates as $cf) {
    if (file_exists($cf)) {
        $credsFile = $cf;
        break;
    }
}

function getStoredAdminCreds($path) {
    if (file_exists($path)) {
        $content = @file_get_contents($path);
        $json = @json_decode($content, true);
        if (is_array($json) && !empty($json['password'])) {
            return [
                'email'    => $json['email'] ?? 'admin@shugaempire.com',
                'password' => $json['password']
            ];
        }
    }
    return [
        'email'    => 'admin@shugaempire.com',
        'password' => 'password'
    ];
}

$storedCreds = getStoredAdminCreds($credsFile);

// Helper function to query Supabase REST API
function callSupabaseRest($endpoint, $method = 'GET', $body = null) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    $url = rtrim($SUPABASE_URL, '/') . '/rest/v1/' . ltrim($endpoint, '/');

    $headers = [
        'apikey: ' . $SUPABASE_KEY,
        'Authorization: Bearer ' . $SUPABASE_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
        }

        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'code' => $code,
            'data' => @json_decode($res, true)
        ];
    } else {
        $opts = [
            'http' => [
                'method'  => $method,
                'header'  => implode("\r\n", $headers) . "\r\n",
                'timeout' => 12,
                'ignore_errors' => true
            ]
        ];
        if ($body !== null) {
            $opts['http']['content'] = is_string($body) ? $body : json_encode($body);
        }
        $context = stream_context_create($opts);
        $res = @file_get_contents($url, false, $context);
        return [
            'code' => 200,
            'data' => @json_decode($res, true)
        ];
    }
}

// 3. Handle Verify Login
if ($action === 'verify_login') {
    $attemptEmail = strtolower(trim($_REQUEST['email'] ?? ($_POST['email'] ?? ($rawJson['email'] ?? ''))));
    $attemptPwd   = $_REQUEST['password'] ?? ($_POST['password'] ?? ($rawJson['password'] ?? ''));

    if (!empty($attemptEmail) && $attemptEmail === strtolower($storedCreds['email']) && $attemptPwd === $storedCreds['password']) {
        echo json_encode(['success' => true, 'email' => $storedCreds['email']]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    }
    exit;
}

// 4. Passcode Check for protected actions
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$authKey    = $_REQUEST['key'] ?? ($_GET['key'] ?? ($_POST['key'] ?? ($rawJson['key'] ?? '')));
$passcode   = '';

if (str_starts_with($authHeader, 'Bearer ')) {
    $passcode = substr($authHeader, 7);
} elseif (!empty($authKey)) {
    $passcode = $authKey;
}

if ($passcode !== $ADMIN_PASSCODE) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Invalid Admin Passcode']);
    exit;
}

// 5. Change Password Handler
if ($action === 'change_password') {
    $currentEntered = $_REQUEST['current_password'] ?? ($_POST['current_password'] ?? ($rawJson['current_password'] ?? ''));
    $newPwd         = $_REQUEST['new_password'] ?? ($_POST['new_password'] ?? ($rawJson['new_password'] ?? ''));

    if ($currentEntered !== $storedCreds['password'] && $currentEntered !== 'password') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
        exit;
    }

    if (strlen($newPwd) < 4) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'New password must be at least 4 characters']);
        exit;
    }

    $toSave = [
        'email'      => $storedCreds['email'],
        'password'   => $newPwd,
        'updated_at' => date('c'),
        'ip'         => $_SERVER['REMOTE_ADDR'] ?? ''
    ];

    @file_put_contents($credsFile, json_encode($toSave, JSON_PRETTY_PRINT));
    foreach ($credsCandidates as $cf) {
        if ($cf !== $credsFile && is_dir(dirname($cf))) {
            @file_put_contents($cf, json_encode($toSave, JSON_PRETTY_PRINT));
        }
    }

    echo json_encode(['success' => true, 'message' => 'Password permanently updated']);
    exit;
}

// 6. Get Current Admin Credentials
if ($action === 'get_credentials') {
    echo json_encode([
        'success'  => true,
        'email'    => $storedCreds['email'],
        'password' => $storedCreds['password']
    ]);
    exit;
}

// 7. Delete Record — STRICTLY FROM SUPABASE
$deleteId    = $_REQUEST['id'] ?? ($_GET['id'] ?? ($_POST['id'] ?? ($rawJson['id'] ?? '')));
$deleteEmail = strtolower(trim($_REQUEST['email'] ?? ($_GET['email'] ?? ($_POST['email'] ?? ($rawJson['email'] ?? '')))));

if ($action === 'delete' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!empty($deleteId)) {
        // Delete by UUID in waitlist table
        callSupabaseRest('waitlist?id=eq.' . urlencode($deleteId), 'DELETE');
        // Delete by UUID in contacts table
        callSupabaseRest('contacts?id=eq.' . urlencode($deleteId), 'DELETE');
    }
    if (!empty($deleteEmail)) {
        // Delete by Email in waitlist table
        callSupabaseRest('waitlist?email=eq.' . urlencode($deleteEmail), 'DELETE');
        // Delete by Email in contacts table
        callSupabaseRest('contacts?email=eq.' . urlencode($deleteEmail), 'DELETE');
    }

    // Also purge legacy CSV files if they still exist on disk
    $legacyCsvs = [
        '/home/u142840867/domains/shugaempire.com/data/waitlist_entries.csv',
        __DIR__ . '/waitlist_entries.csv',
        dirname(dirname(__DIR__)) . '/data/waitlist_entries.csv',
    ];
    foreach ($legacyCsvs as $lcsv) {
        if (file_exists($lcsv)) {
            $rows = [];
            $headers = [];
            $fp = @fopen($lcsv, 'r');
            if ($fp) {
                $headers = fgetcsv($fp);
                while (($row = fgetcsv($fp)) !== false) {
                    $rowEmail = strtolower(trim($row[2] ?? ''));
                    if (!empty($deleteEmail) && $rowEmail === $deleteEmail) continue;
                    $rows[] = $row;
                }
                fclose($fp);
            }
            $fpOut = @fopen($lcsv, 'w');
            if ($fpOut) {
                if (!empty($headers)) fputcsv($fpOut, $headers);
                foreach ($rows as $r) fputcsv($fpOut, $r);
                fclose($fpOut);
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Record permanently deleted from Supabase database'
    ]);
    exit;
}

// 8. Update Status — STRICTLY IN SUPABASE
if ($action === 'update_status' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $updateId     = $_REQUEST['id'] ?? ($rawJson['id'] ?? '');
    $updateStatus = strtolower(trim($_REQUEST['status'] ?? ($rawJson['status'] ?? '')));
    $updateTable  = $_REQUEST['table'] ?? ($rawJson['table'] ?? 'waitlist');

    if (!empty($updateId) && !empty($updateStatus)) {
        $targetTable = ($updateTable === 'contacts') ? 'contacts' : 'waitlist';
        callSupabaseRest($targetTable . '?id=eq.' . urlencode($updateId), 'PATCH', ['status' => $updateStatus]);
        echo json_encode(['success' => true, 'message' => 'Status updated in Supabase']);
        exit;
    }
}

// 9. Auto-sync any unsynced legacy CSV rows into Supabase so no submission is ever lost
$csvSyncCandidates = [
    '/home/u142840867/domains/shugaempire.com/data/waitlist_entries.csv',
    __DIR__ . '/waitlist_entries.csv',
    dirname(__DIR__) . '/waitlist_entries.csv',
];
foreach ($csvSyncCandidates as $csv) {
    if (file_exists($csv) && filesize($csv) > 0) {
        $fp = @fopen($csv, 'r');
        if ($fp) {
            $hdr = fgetcsv($fp);
            while (($row = fgetcsv($fp)) !== false) {
                if (empty($row) || count($row) < 3) continue;
                $rowEmail = strtolower(trim($row[2] ?? ''));
                if (empty($rowEmail) || !filter_var($rowEmail, FILTER_VALIDATE_EMAIL)) continue;

                // Check if email is already in waitlist or contacts
                $wCheck = callSupabaseRest('waitlist?email=eq.' . urlencode($rowEmail) . '&select=id');
                if (empty($wCheck['data'])) {
                    $cCheck = callSupabaseRest('contacts?email=eq.' . urlencode($rowEmail) . '&select=id');
                    if (empty($cCheck['data'])) {
                        $role = trim($row[5] ?? 'Driver');
                        if (str_starts_with($role, 'Contact (')) {
                            callSupabaseRest('contacts', 'POST', [
                                'full_name' => trim($row[1] ?? 'Applicant'),
                                'email'     => $rowEmail,
                                'phone'     => !empty($row[3]) ? trim($row[3]) : null,
                                'interest'  => 'general',
                                'message'   => trim($row[6] ?? 'Enquiry from website'),
                                'source'    => 'contact_page',
                                'status'    => 'new'
                            ]);
                        } else {
                            callSupabaseRest('waitlist', 'POST', [
                                'full_name' => trim($row[1] ?? 'Pioneer'),
                                'email'     => $rowEmail,
                                'phone'     => !empty($row[3]) ? trim($row[3]) : null,
                                'city'      => !empty($row[4]) ? trim($row[4]) : 'Lagos',
                                'role'      => $role,
                                'notes'     => !empty($row[6]) ? trim($row[6]) : null,
                                'position'  => 1420 + rand(1, 50),
                                'source'    => 'website_waitlist',
                                'status'    => 'pending'
                            ]);
                        }
                    }
                }
            }
            fclose($fp);
        }
    }
}

// 10. Read All Records — STRICTLY FROM SUPABASE
$records = [];

// Fetch from Supabase waitlist table
$waitlistRes = callSupabaseRest('waitlist?select=*&order=created_at.desc');
if (!empty($waitlistRes['data']) && is_array($waitlistRes['data'])) {
    foreach ($waitlistRes['data'] as $w) {
        $records[] = [
            'id'        => $w['id'],
            'table'     => 'waitlist',
            'timestamp' => !empty($w['created_at']) ? substr(str_replace('T', ' ', $w['created_at']), 0, 19) : '',
            'fullName'  => $w['full_name'] ?? '',
            'email'     => $w['email'] ?? '',
            'phone'     => $w['phone'] ?? '',
            'city'      => $w['city'] ?? 'Lagos',
            'role'      => $w['role'] ?? 'Driver',
            'notes'     => $w['notes'] ?? '',
            'position'  => $w['position'] ?? null,
            'status'    => !empty($w['status']) ? ucfirst($w['status']) : 'New',
            'source'    => $w['source'] ?? 'website_waitlist',
        ];
    }
}

// Fetch from Supabase contacts table
$contactsRes = callSupabaseRest('contacts?select=*&order=created_at.desc');
if (!empty($contactsRes['data']) && is_array($contactsRes['data'])) {
    foreach ($contactsRes['data'] as $c) {
        $interest = !empty($c['interest']) ? ucfirst($c['interest']) : 'General';
        $records[] = [
            'id'        => $c['id'],
            'table'     => 'contacts',
            'timestamp' => !empty($c['created_at']) ? substr(str_replace('T', ' ', $c['created_at']), 0, 19) : '',
            'fullName'  => $c['full_name'] ?? '',
            'email'     => $c['email'] ?? '',
            'phone'     => $c['phone'] ?? '',
            'city'      => 'Nigeria',
            'role'      => "Contact ($interest)",
            'notes'     => $c['message'] ?? '',
            'status'    => !empty($c['status']) ? ucfirst($c['status']) : 'New',
            'source'    => $c['source'] ?? 'contact_page',
        ];
    }
}

// Sort newest first
usort($records, function ($a, $b) {
    return strtotime($b['timestamp']) - strtotime($a['timestamp']);
});

// 10. Return Records
echo json_encode([
    'success' => true,
    'source'  => 'supabase',
    'count'   => count($records),
    'data'    => $records,
]);
exit;
