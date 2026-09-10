<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// 1. Read JSON input
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    // Fallback to standard form post if JSON was not parsed
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

// 3. Storage Directory & CSV file
$storageDir = __DIR__ . '/../../data';
if (!is_dir($storageDir)) {
    @mkdir($storageDir, 0755, true);
}

// If data dir can't be created outside public_html, store locally in protected data directory
$csvFile = is_dir($storageDir) ? $storageDir . '/waitlist.csv' : __DIR__ . '/waitlist_entries.csv';

$isNew = !file_exists($csvFile) || filesize($csvFile) === 0;

$fp = @fopen($csvFile, 'a');
if ($fp) {
    if ($isNew) {
        fputcsv($fp, ['Timestamp', 'Full Name', 'Email', 'Phone', 'City', 'Role', 'Notes', 'IP Address', 'User Agent']);
    }

    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

    fputcsv($fp, [$timestamp, $fullName, $email, $phone, $city, $role, $notes, $ip, $ua]);
    fclose($fp);
}

// Count total waitlist entries for queue position
$queueCount = 1420;
if (file_exists($csvFile)) {
    $lines = @count(file($csvFile));
    if ($lines > 1) {
        $queueCount += ($lines - 1);
    }
}

// 4. Send Email Notification (Optional, non-blocking)
$to = 'contact@shugaempire.com';
$subject = "⚡ New Shuga Empire Waitlist Signup: $fullName ($role)";
$message = "A new pioneer has joined the Shuga Empire Waitlist:\n\n"
         . "Name: $fullName\n"
         . "Email: $email\n"
         . "Phone: $phone\n"
         . "City: $city\n"
         . "Role: $role\n"
         . "Notes: $notes\n"
         . "Time: " . date('r') . "\n\n"
         . "Total queue: #$queueCount\n";
$headers = "From: noreply@shugaempire.com\r\n"
         . "Reply-To: $email\r\n"
         . "X-Mailer: PHP/" . phpversion();

@mail($to, $subject, $message, $headers);

// 5. Return success JSON
echo json_encode([
    'success'  => true,
    'message'  => "Welcome aboard, $fullName! You are officially on the Shuga Empire waitlist.",
    'position' => $queueCount,
    'role'     => $role,
]);
exit;
