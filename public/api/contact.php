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

$timestamp = date('Y-m-d H:i:s');
$ip        = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
$ua        = $_SERVER['HTTP_USER_AGENT'] ?? '';

// Format formatted role for waitlist entries
$interestFormatted = ucfirst($interest);
$roleTag = "Contact ($interestFormatted)";

// 3. Persistent Data Directories
$dataDirs = [
    '/home/u142840867/domains/shugaempire.com/data',
    dirname(dirname(__DIR__)) . '/data',
    __DIR__ . '/../../data',
    __DIR__,
];

$mainDataDir = $dataDirs[0];
foreach ($dataDirs as $dir) {
    if (is_dir($dir)) {
        $mainDataDir = $dir;
        break;
    }
}
if (!is_dir($mainDataDir)) {
    @mkdir($mainDataDir, 0777, true);
}

// 4. Save to waitlist_entries.csv so admin instantly sees it in the dashboard
$waitlistCandidates = [
    '/home/u142840867/domains/shugaempire.com/data/waitlist_entries.csv',
    $mainDataDir . '/waitlist_entries.csv',
    __DIR__ . '/waitlist_entries.csv',
];

foreach ($waitlistCandidates as $wFile) {
    $dir = dirname($wFile);
    if (!is_dir($dir)) @mkdir($dir, 0777, true);
    
    $isNew = !file_exists($wFile) || filesize($wFile) === 0;
    $fp = @fopen($wFile, 'a');
    if ($fp) {
        if ($isNew) {
            fputcsv($fp, ['Timestamp', 'Full Name', 'Email', 'Phone', 'City', 'Role', 'Notes', 'IP Address', 'User Agent']);
        }
        fputcsv($fp, [$timestamp, $fullName, $email, $phone, 'Nigeria', $roleTag, $message, $ip, $ua]);
        fclose($fp);
    }
}

// 5. Save to dedicated contact_messages.csv
$contactCsvCandidates = [
    '/home/u142840867/domains/shugaempire.com/data/contact_messages.csv',
    $mainDataDir . '/contact_messages.csv',
    __DIR__ . '/contact_messages.csv',
];

foreach ($contactCsvCandidates as $cCsv) {
    $dir = dirname($cCsv);
    if (!is_dir($dir)) @mkdir($dir, 0777, true);

    $isNew = !file_exists($cCsv) || filesize($cCsv) === 0;
    $fp = @fopen($cCsv, 'a');
    if ($fp) {
        if ($isNew) {
            fputcsv($fp, ['Timestamp', 'Full Name', 'Email', 'Phone', 'Interest', 'Message', 'IP Address', 'User Agent']);
        }
        fputcsv($fp, [$timestamp, $fullName, $email, $phone, $interestFormatted, $message, $ip, $ua]);
        fclose($fp);
    }
}

// 6. Save to dedicated contact_messages.json
$contactJsonCandidates = [
    '/home/u142840867/domains/shugaempire.com/data/contact_messages.json',
    $mainDataDir . '/contact_messages.json',
    __DIR__ . '/contact_messages.json',
];

$record = [
    'id'        => 'msg_' . time() . '_' . substr(md5($email . $timestamp), 0, 6),
    'timestamp' => $timestamp,
    'name'      => $fullName,
    'email'     => $email,
    'phone'     => $phone,
    'interest'  => $interestFormatted,
    'message'   => $message,
    'ip'        => $ip,
    'status'    => 'new'
];

foreach ($contactJsonCandidates as $cJson) {
    $dir = dirname($cJson);
    if (!is_dir($dir)) @mkdir($dir, 0777, true);

    $existing = [];
    if (file_exists($cJson)) {
        $existing = @json_decode(file_get_contents($cJson), true) ?: [];
    }
    array_unshift($existing, $record);
    @file_put_contents($cJson, json_encode($existing, JSON_PRETTY_PRINT));
}

// 7. Send Email Alert (non-blocking)
$to = 'contact@shugaempire.com';
$subject = "📩 New Sugar Empire HoldCo Contact Inquiry: $fullName ($interestFormatted)";
$body = "New Contact Enquiry Submitted:\n\n"
      . "Name: $fullName\n"
      . "Email: $email\n"
      . "Phone: $phone\n"
      . "Interest: $interestFormatted\n"
      . "Timestamp: $timestamp\n\n"
      . "Message:\n$message\n\n"
      . "--\nSugar Empire HoldCo Admin Notification System";

$headers = "From: noreply@shugaempire.com\r\n"
         . "Reply-To: $email\r\n"
         . "X-Mailer: PHP/" . phpversion();

@mail($to, $subject, $body, $headers);

// 8. Return response
echo json_encode([
    'success' => true,
    'message' => "Thank you, $fullName. Your enquiry has been received and routed to the Shuga Admin Command Center.",
    'id'      => $record['id']
]);
