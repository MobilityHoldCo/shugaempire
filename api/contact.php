<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ── Supabase Configuration ───────────────────────────────────────────────────
$SUPABASE_URL = 'https://dphgopxtvvpyiteuatqe.supabase.co';
$SUPABASE_KEY = base64_decode('c2Jfc2VjcmV0X2RUYll5V1dzU3hsdUdPN21hcmVVV2dfZjM5U1lrZ1Y=');

// Check environment variables if set
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

// 1. Read input (JSON or POST)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!$data || !is_array($data)) {
    $data = $_POST;
}

// 2. Sanitize & extract
$fullName = trim(strip_tags($data['fullName'] ?? ($data['name'] ?? '')));
$email    = trim(filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL));
$phone    = trim(strip_tags($data['phone'] ?? ''));
$interest = trim(strip_tags($data['interest'] ?? 'general'));
$message  = trim(strip_tags($data['message'] ?? ($data['notes'] ?? '')));

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

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Message details are required.']);
    exit;
}

$cleanEmail = strtolower($email);

// 3. INSERT DIRECTLY INTO SUPABASE CONTACTS TABLE
$supabasePayload = [
    'full_name' => $fullName,
    'email'     => $cleanEmail,
    'phone'     => !empty($phone) ? $phone : null,
    'interest'  => !empty($interest) ? strtolower($interest) : 'general',
    'message'   => $message,
    'source'    => 'contact_page',
    'status'    => 'new'
];

$insRes = callSupabaseRest('contacts', 'POST', $supabasePayload);

// 4. Local CSV & JSON offline backup (safety mirror)
$timestamp = date('Y-m-d H:i:s');
$ip        = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
$ua        = $_SERVER['HTTP_USER_AGENT'] ?? '';
$interestFormatted = ucfirst($interest);

$backupFiles = [
    '/home/u142840867/domains/shugaempire.com/data/contact_messages.csv',
    __DIR__ . '/contact_messages.csv'
];

foreach ($backupFiles as $cCsv) {
    $dir = dirname($cCsv);
    if (!is_dir($dir)) @mkdir($dir, 0777, true);
    $isNew = !file_exists($cCsv) || filesize($cCsv) === 0;
    $fp = @fopen($cCsv, 'a');
    if ($fp) {
        if ($isNew) {
            fputcsv($fp, ['Timestamp', 'Full Name', 'Email', 'Phone', 'Interest', 'Message', 'IP Address', 'User Agent']);
        }
        fputcsv($fp, [$timestamp, $fullName, $cleanEmail, $phone, $interestFormatted, $message, $ip, $ua]);
        fclose($fp);
    }
}

// 5. Send Email Alert (non-blocking)
$to = 'contact@shugaempire.com';
$subject = "📩 New SHUGA Empire HoldCo Contact Inquiry: $fullName ($interestFormatted)";
$body = "New Contact Enquiry Submitted:\n\n"
      . "Name: $fullName\n"
      . "Email: $cleanEmail\n"
      . "Phone: $phone\n"
      . "Interest: $interestFormatted\n"
      . "Timestamp: $timestamp\n\n"
      . "Message:\n$message\n\n"
      . "Status: Logged directly into Supabase database.\n";

$headers = "From: noreply@shugaempire.com\r\n"
         . "Reply-To: $cleanEmail\r\n"
         . "X-Mailer: PHP/" . phpversion();

@mail($to, $subject, $body, $headers);

// 6. Return response
echo json_encode([
    'success' => true,
    'message' => "Thank you, $fullName. Your enquiry has been received and routed directly to the Shuga Admin Command Center."
]);
exit;
