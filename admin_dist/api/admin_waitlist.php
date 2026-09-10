<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Secret Admin Passcode for API authorization
$ADMIN_PASSCODE = 'ShugaAdmin2026!';

// Check passcode from header or query param
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$authQuery  = $_GET['key'] ?? '';
$passcode   = '';

if (str_starts_with($authHeader, 'Bearer ')) {
    $passcode = substr($authHeader, 7);
} elseif (!empty($authQuery)) {
    $passcode = $authQuery;
}

if ($passcode !== $ADMIN_PASSCODE) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Invalid Admin Passcode']);
    exit;
}

// 2. CSV File Location - Multi-path locator for main domain and subdomain setups
$candidates = [
    __DIR__ . '/waitlist_entries.csv',
    dirname(dirname(__DIR__)) . '/api/waitlist_entries.csv',
    dirname(dirname(__DIR__)) . '/data/waitlist.csv',
    __DIR__ . '/../../data/waitlist.csv',
    dirname(__DIR__) . '/waitlist_entries.csv',
    ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/api/waitlist_entries.csv',
    ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/../public_html/api/waitlist_entries.csv',
    '/home/u142840867/domains/shugaempire.com/public_html/api/waitlist_entries.csv',
    '/home/u142840867/domains/shugaempire.com/data/waitlist.csv',
];

$csvFile = __DIR__ . '/waitlist_entries.csv';
foreach ($candidates as $cand) {
    if (!empty($cand) && file_exists($cand) && filesize($cand) > 0) {
        $csvFile = $cand;
        break;
    }
}

// If export requested as raw CSV download
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    if (!file_exists($csvFile)) {
        http_response_code(404);
        die('No waitlist records found.');
    }
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="shuga_waitlist_' . date('Y-m-d') . '.csv"');
    readfile($csvFile);
    exit;
}

// 3. Read All Records
$records = [];
if (file_exists($csvFile)) {
    $fp = fopen($csvFile, 'r');
    if ($fp) {
        $headers = fgetcsv($fp);
        $id = 1;
        while (($row = fgetcsv($fp)) !== false) {
            if (count($row) >= 6) {
                $records[] = [
                    'id'        => $id++,
                    'timestamp' => $row[0] ?? '',
                    'fullName'  => $row[1] ?? '',
                    'email'     => $row[2] ?? '',
                    'phone'     => $row[3] ?? '',
                    'city'      => $row[4] ?? 'Lagos',
                    'role'      => $row[5] ?? 'Driver',
                    'notes'     => $row[6] ?? '',
                    'status'    => $row[7] ?? 'New',
                ];
            }
        }
        fclose($fp);
    }
}

// Reverse so newest entries appear first
$records = array_reverse($records);

// 4. Return Records
echo json_encode([
    'success' => true,
    'count'   => count($records),
    'data'    => $records,
]);
exit;
