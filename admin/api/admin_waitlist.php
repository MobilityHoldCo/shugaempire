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

$rawJson = @json_decode(file_get_contents('php://input'), true);
if (!is_array($rawJson)) {
    $rawJson = [];
}

// Check passcode from header, GET, POST, or JSON body
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

// 2. Candidate CSV File Locations
$candidates = [
    '/home/u142840867/domains/shugaempire.com/data/waitlist_entries.csv',
    __DIR__ . '/waitlist_entries.csv',
    dirname(dirname(__DIR__)) . '/data/waitlist_entries.csv',
    dirname(dirname(__DIR__)) . '/api/waitlist_entries.csv',
    dirname(dirname(__DIR__)) . '/data/waitlist.csv',
    __DIR__ . '/../../data/waitlist_entries.csv',
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
$exportParam = $_REQUEST['export'] ?? ($_GET['export'] ?? ($rawJson['export'] ?? ''));
if ($exportParam === 'csv') {
    if (!file_exists($csvFile)) {
        http_response_code(404);
        die('No waitlist records found.');
    }
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="shuga_waitlist_' . date('Y-m-d') . '.csv"');
    readfile($csvFile);
    exit;
}

// 3. If delete requested - purge from ALL existing candidate files
$action          = $_REQUEST['action'] ?? ($_GET['action'] ?? ($_POST['action'] ?? ($rawJson['action'] ?? '')));
$deleteId        = $_REQUEST['id'] ?? ($_GET['id'] ?? ($_POST['id'] ?? ($rawJson['id'] ?? '')));
$deleteEmail     = strtolower(trim($_REQUEST['email'] ?? ($_GET['email'] ?? ($_POST['email'] ?? ($rawJson['email'] ?? '')))));
$deleteTimestamp = trim($_REQUEST['timestamp'] ?? ($_GET['timestamp'] ?? ($_POST['timestamp'] ?? ($rawJson['timestamp'] ?? ''))));
$deleteName      = strtolower(trim($_REQUEST['name'] ?? ($_GET['name'] ?? ($_POST['name'] ?? ($rawJson['name'] ?? '')))));

if ($action === 'delete') {
    $deletedAny = false;
    $seenPaths  = [];

    foreach ($candidates as $cand) {
        if (!empty($cand) && file_exists($cand)) {
            $real = realpath($cand);
            if ($real && in_array($real, $seenPaths)) continue;
            if ($real) $seenPaths[] = $real;

            $rows    = [];
            $headers = [];
            $fp = @fopen($cand, 'r');
            if ($fp) {
                $headers = fgetcsv($fp);
                $currId = 1;
                while (($row = fgetcsv($fp)) !== false) {
                    if (empty($row) || count($row) < 2) continue;
                    $rowTimestamp = trim($row[0] ?? '');
                    $rowName      = strtolower(trim($row[1] ?? ''));
                    $rowEmail     = strtolower(trim($row[2] ?? ''));

                    $match = false;
                    if (!empty($deleteEmail) && $rowEmail === $deleteEmail) {
                        $match = true;
                    } elseif (!empty($deleteTimestamp) && !empty($deleteName) && $rowTimestamp === $deleteTimestamp && $rowName === $deleteName) {
                        $match = true;
                    } elseif (!empty($deleteId) && is_numeric($deleteId) && intval($deleteId) === $currId) {
                        $match = true;
                    }

                    if ($match) {
                        $deletedAny = true;
                    } else {
                        $rows[] = $row;
                    }
                    $currId++;
                }
                fclose($fp);
            }

            // Rewrite CSV without the deleted row
            $fpOut = @fopen($cand, 'w');
            if ($fpOut) {
                if (!empty($headers)) {
                    fputcsv($fpOut, $headers);
                }
                foreach ($rows as $r) {
                    fputcsv($fpOut, $r);
                }
                fclose($fpOut);
            }
        }
    }

    echo json_encode(['success' => true, 'deleted' => $deletedAny, 'message' => 'Record deleted successfully']);
    exit;
}

// 4. Read All Records
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
                    'status'    => 'New',
                    'ip'        => $row[7] ?? '',
                ];
            }
        }
        fclose($fp);
    }
}

// Reverse so newest entries appear first
$records = array_reverse($records);

// 5. Return Records
echo json_encode([
    'success' => true,
    'count'   => count($records),
    'data'    => $records,
]);
exit;
