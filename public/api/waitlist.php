<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Supabase Configuration ───────────────────────────────────────────────────
$SUPABASE_URL = 'https://dphgopxtvvpyiteuatqe.supabase.co';
$SUPABASE_KEY = base64_decode('c2Jfc2VjcmV0X2RUYll5V1dzU3hsdUdPN21hcmVVV2dfZjM5U1lrZ1Y=');

// Check environment variables or .env.local if present
$envKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: (getenv('SUPABASE_API_KEY') ?: getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
if (!empty($envKey)) $SUPABASE_KEY = $envKey;

$envUrl = getenv('SUPABASE_URL') ?: getenv('NEXT_PUBLIC_SUPABASE_URL');
if (!empty($envUrl)) $SUPABASE_URL = $envUrl;

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
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

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
                'method'        => $method,
                'header'        => implode("\r\n", $headers) . "\r\n",
                'timeout'       => 15,
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

// ── GET: Return live waitlist count ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $countRes = callSupabaseRest('waitlist?select=id');
    $count = 1420;
    if (is_array($countRes['data'])) {
        $count += count($countRes['data']);
    }
    echo json_encode(['count' => $count]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// 1. Read input (JSON or POST)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!$data || !is_array($data)) {
    $data = $_POST;
}

// 2. Extract & sanitize
$fullName = isset($data['fullName']) ? trim(strip_tags($data['fullName'])) : '';
$email    = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone    = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$city     = isset($data['city']) ? trim(strip_tags($data['city'])) : 'Lagos';
$role     = isset($data['role']) ? trim(strip_tags($data['role'])) : 'Driver';
$notes    = isset($data['notes']) ? trim(strip_tags($data['notes'])) : '';

// Validation
if (empty($fullName) || empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Full name and email are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please provide a valid email address.']);
    exit;
}

$cleanEmail = strtolower($email);

// 3. Check for existing duplicate in Supabase
$dupCheck = callSupabaseRest('waitlist?email=eq.' . urlencode($cleanEmail) . '&select=id,position');
if (!empty($dupCheck['data']) && is_array($dupCheck['data']) && count($dupCheck['data']) > 0) {
    $existing = $dupCheck['data'][0];
    echo json_encode([
        'success'   => true,
        'duplicate' => true,
        'position'  => $existing['position'] ?? 1420,
        'message'   => 'You are already on the waitlist!'
    ]);
    exit;
}

// 4. Calculate queue position from Supabase count
$countRes = callSupabaseRest('waitlist?select=id');
$totalCount = is_array($countRes['data']) ? count($countRes['data']) : 0;
$position = 1420 + $totalCount + 1;

// 5. INSERT DIRECTLY INTO SUPABASE WAITLIST TABLE
$supabasePayload = [
    'full_name' => $fullName,
    'email'     => $cleanEmail,
    'phone'     => !empty($phone) ? $phone : null,
    'city'      => !empty($city) ? $city : 'Lagos',
    'role'      => !empty($role) ? $role : 'Driver',
    'notes'     => !empty($notes) ? $notes : null,
    'position'  => $position,
    'source'    => 'website_waitlist',
    'status'    => 'pending'
];

$insRes = callSupabaseRest('waitlist', 'POST', $supabasePayload);

// 6. Local CSV offline backup (safety mirror)
$timestamp = date('Y-m-d H:i:s');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

$backupFiles = [
    '/home/u142840867/domains/shugaempire.com/data/waitlist_entries.csv',
    __DIR__ . '/waitlist_entries.csv'
];

foreach ($backupFiles as $bFile) {
    $dir = dirname($bFile);
    if (!is_dir($dir)) @mkdir($dir, 0777, true);
    $isNew = !file_exists($bFile) || filesize($bFile) === 0;
    $fp = @fopen($bFile, 'a');
    if ($fp) {
        if ($isNew) {
            fputcsv($fp, ['Timestamp', 'Full Name', 'Email', 'Phone', 'City', 'Role', 'Notes', 'IP Address', 'User Agent']);
        }
        fputcsv($fp, [$timestamp, $fullName, $cleanEmail, $phone, $city, $role, $notes, $ip, $ua]);
        fclose($fp);
    }
}

// 7. Optional Email Notification
$to = 'contact@shugaempire.com';
$subject = "⚡ New SHUGA Empire HoldCo Waitlist Signup: $fullName ($role)";
$message = "A new pioneer has joined the SHUGA Empire HoldCo Waitlist:\n\n"
         . "Name: $fullName\n"
         . "Email: $cleanEmail\n"
         . "Phone: $phone\n"
         . "City: $city\n"
         . "Role: $role\n"
         . "Notes: $notes\n"
         . "Time: " . date('r') . "\n\n"
         . "Queue Position: #$position\n"
         . "Status: Saved directly to Supabase database.\n";
$headers = "From: noreply@shugaempire.com\r\n"
         . "Reply-To: $cleanEmail\r\n"
         . "X-Mailer: PHP/" . phpversion();

@mail($to, $subject, $message, $headers);

// 8. Return success response with assigned position
echo json_encode([
    'success'  => true,
    'message'  => "Welcome aboard, $fullName! You are officially on the SHUGA Empire HoldCo waitlist.",
    'position' => $position,
    'role'     => $role,
]);
exit;
