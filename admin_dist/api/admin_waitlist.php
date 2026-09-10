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

// 3. Handle Verify Login (can be called by login form directly)
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

// 3b. Handle Contact Form Submission
if ($action === 'contact_submit') {
    $fullName = trim(strip_tags($_REQUEST['fullName'] ?? ($_REQUEST['name'] ?? ($rawJson['fullName'] ?? ($rawJson['name'] ?? '')))));
    $email    = trim(filter_var($_REQUEST['email'] ?? ($rawJson['email'] ?? ''), FILTER_SANITIZE_EMAIL));
    $phone    = trim(strip_tags($_REQUEST['phone'] ?? ($rawJson['phone'] ?? '')));
    $interest = trim(strip_tags($_REQUEST['interest'] ?? ($rawJson['interest'] ?? 'General')));
    $message  = trim(strip_tags($_REQUEST['message'] ?? ($_REQUEST['notes'] ?? ($rawJson['message'] ?? ($rawJson['notes'] ?? '')))));

    if (empty($fullName) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name, email, and message are required']);
        exit;
    }

    $timestamp = date('Y-m-d H:i:s');
    $ip        = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $ua        = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $roleTag   = "Contact (" . ucfirst($interest) . ")";

    $targetCsv = '/home/u142840867/domains/shugaempire.com/data/waitlist_entries.csv';
    if (!file_exists($targetCsv)) {
        $targetCsv = __DIR__ . '/waitlist_entries.csv';
    }

    $isNew = !file_exists($targetCsv) || filesize($targetCsv) === 0;
    $fp = @fopen($targetCsv, 'a');
    if ($fp) {
        if ($isNew) {
            fputcsv($fp, ['Timestamp', 'Full Name', 'Email', 'Phone', 'City', 'Role', 'Notes', 'IP Address', 'User Agent']);
        }
        fputcsv($fp, [$timestamp, $fullName, $email, $phone, 'Nigeria', $roleTag, $message, $ip, $ua]);
        fclose($fp);
    }

    // Also write to dedicated contact_messages.csv
    $contactCsv = dirname($targetCsv) . '/contact_messages.csv';
    $isNewContact = !file_exists($contactCsv) || filesize($contactCsv) === 0;
    $fp2 = @fopen($contactCsv, 'a');
    if ($fp2) {
        if ($isNewContact) {
            fputcsv($fp2, ['Timestamp', 'Full Name', 'Email', 'Phone', 'Interest', 'Message', 'IP Address', 'User Agent']);
        }
        fputcsv($fp2, [$timestamp, $fullName, $email, $phone, ucfirst($interest), $message, $ip, $ua]);
        fclose($fp2);
    }

    echo json_encode(['success' => true, 'message' => 'Enquiry transmitted to Admin']);
    exit;
}

// 4. Passcode Check for protected administrative actions
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

// 5. Change Password Handler (permanently updates data/admin_creds.json)
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

    $dataDir = dirname($credsFile);
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0777, true);
    }

    $toSave = [
        'email'      => $storedCreds['email'],
        'password'   => $newPwd,
        'updated_at' => date('c'),
        'ip'         => $_SERVER['REMOTE_ADDR'] ?? ''
    ];

    $saved = @file_put_contents($credsFile, json_encode($toSave, JSON_PRETTY_PRINT));
    
    // Also backup to other candidate paths if they exist
    foreach ($credsCandidates as $cf) {
        if ($cf !== $credsFile && is_dir(dirname($cf))) {
            @file_put_contents($cf, json_encode($toSave, JSON_PRETTY_PRINT));
        }
    }

    echo json_encode(['success' => true, 'message' => 'Password permanently updated on server']);
    exit;
}

// 6. Get Current Admin Credentials (returns server stored password)
if ($action === 'get_credentials') {
    echo json_encode([
        'success'  => true,
        'email'    => $storedCreds['email'],
        'password' => $storedCreds['password']
    ]);
    exit;
}

// 7. Candidate CSV File Locations
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

// 8. If delete requested - purge from ALL existing candidate files
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

// 9. Read All Records
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

// 10. Return Records
echo json_encode([
    'success' => true,
    'count'   => count($records),
    'data'    => $records,
]);
exit;
