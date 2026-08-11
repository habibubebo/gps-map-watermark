<?php
/**
 * GPS Watermark — Server Sync API
 *
 * Satu endpoint untuk semua operasi template.
 * Dihubungi otomatis oleh client dari window.location.
 *
 * Jalankan (development):
 *   php -S 0.0.0.0:3000 -t .
 *
 * Atau deploy di Apache/Nginx sebagai file biasa.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$DATA_DIR = __DIR__ . '/server-data';
$TEMPLATES_FILE = $DATA_DIR . '/templates.json';

if (!is_dir($DATA_DIR)) mkdir($DATA_DIR, 0777, true);
if (!file_exists($TEMPLATES_FILE)) file_put_contents($TEMPLATES_FILE, '{}');

function readData(): array {
    global $TEMPLATES_FILE;
    $data = json_decode(file_get_contents($TEMPLATES_FILE), true);
    return is_array($data) ? $data : [];
}

function writeData(array $data): void {
    global $TEMPLATES_FILE;
    file_put_contents($TEMPLATES_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}

function getDeviceEntry(string $deviceId): array {
    $data = readData();
    $entry = $data[$deviceId] ?? [];
    if (is_array($entry) && array_keys($entry) === range(0, count($entry) - 1)) {
        return ['_meta' => [], 'templates' => $entry];
    }
    return $entry;
}

function setDeviceEntry(string $deviceId, array $entry): void {
    $data = readData();
    $data[$deviceId] = $entry;
    writeData($data);
}

function getDeviceTemplates(string $deviceId): array {
    return getDeviceEntry($deviceId)['templates'] ?? [];
}

function setDeviceTemplates(string $deviceId, array $templates): void {
    $entry = getDeviceEntry($deviceId);
    $entry['templates'] = array_values($templates);
    setDeviceEntry($deviceId, $entry);
}

function jsonResponse(int $code, $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

function generateId(): string {
    return dechex(time()) . bin2hex(random_bytes(4));
}

// ── Main ──────────────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['action'])) {
    jsonResponse(400, ['error' => 'Invalid request']);
    exit;
}

$action = $input['action'];
$deviceId = $input['deviceId'] ?? '';

switch ($action) {

    case 'health':
        jsonResponse(200, ['status' => 'ok', 'timestamp' => date('c')]);
        break;

    case 'get':
        $entry = getDeviceEntry($deviceId);
        jsonResponse(200, [
            'deviceId' => $deviceId,
            'userAgent' => $entry['_meta']['userAgent'] ?? null,
            'templates' => $entry['templates'] ?? [],
        ]);
        break;

    case 'create':
        if (!$deviceId) { jsonResponse(400, ['error' => 'Missing deviceId']); break; }

        $template = array_merge($input, [
            'action' => null,
            'deviceId' => null,
            'userAgent' => null,
            'serverId' => generateId(),
            'createdAt' => date('c'),
            'updatedAt' => date('c'),
            'wmZoom' => $input['wmZoom'] ?? 100,
            'wmTextScale' => $input['wmTextScale'] ?? 100,
        ]);
        unset($template['action'], $template['deviceId'], $template['userAgent']);

        // Simpan userAgent di metadata device
        if (!empty($input['userAgent'])) {
            $entry = getDeviceEntry($deviceId);
            $entry['_meta']['userAgent'] = $input['userAgent'];
            if (!isset($entry['templates'])) $entry['templates'] = [];
            $entry['templates'][] = $template;
            setDeviceEntry($deviceId, $entry);
        } else {
            $templates = getDeviceTemplates($deviceId);
            $templates[] = $template;
            setDeviceTemplates($deviceId, $templates);
        }

        jsonResponse(201, ['success' => true, 'template' => $template]);
        break;

    case 'update':
        $serverId = $input['serverId'] ?? '';
        if (!$deviceId || !$serverId) { jsonResponse(400, ['error' => 'Missing deviceId or serverId']); break; }

        // Simpan userAgent di metadata device
        if (!empty($input['userAgent'])) {
            $entry = getDeviceEntry($deviceId);
            $entry['_meta']['userAgent'] = $input['userAgent'];
            setDeviceEntry($deviceId, $entry);
        }

        $templates = getDeviceTemplates($deviceId);
        $idx = null;
        foreach ($templates as $i => $t) {
            if (($t['serverId'] ?? null) === $serverId) { $idx = $i; break; }
        }

        if ($idx === null) {
            jsonResponse(404, ['error' => 'Template not found']);
            break;
        }

        $payload = $input;
        unset($payload['action'], $payload['deviceId'], $payload['serverId'], $payload['userAgent']);

        $templates[$idx] = array_merge($templates[$idx], $payload, [
            'serverId' => $serverId,
            'updatedAt' => date('c'),
        ]);
        setDeviceTemplates($deviceId, $templates);

        jsonResponse(200, ['success' => true, 'template' => $templates[$idx]]);
        break;

    case 'delete':
        $serverId = $input['serverId'] ?? '';
        $tplIndex = $input['tplIndex'] ?? null;

        if (!$deviceId) { jsonResponse(400, ['error' => 'Missing deviceId']); break; }
        if ($serverId === '' && $tplIndex === null) { jsonResponse(400, ['error' => 'Missing serverId or tplIndex']); break; }

        $templates = getDeviceTemplates($deviceId);
        $found = false;

        if ($serverId !== '') {
            foreach ($templates as $i => $t) {
                if (($t['serverId'] ?? null) === $serverId) {
                    array_splice($templates, $i, 1);
                    $found = true;
                    break;
                }
            }
        } elseif ($tplIndex !== null && isset($templates[$tplIndex])) {
            array_splice($templates, $tplIndex, 1);
            $found = true;
        }

        if (!$found) {
            jsonResponse(404, ['error' => 'Template not found']);
            break;
        }

        setDeviceTemplates($deviceId, $templates);
        jsonResponse(200, ['success' => true]);
        break;

    case 'deleteAll':
        if (!$deviceId) { jsonResponse(400, ['error' => 'Missing deviceId']); break; }
        setDeviceTemplates($deviceId, []);
        jsonResponse(200, ['success' => true]);
        break;

    case 'deleteDevice':
        if (!$deviceId) { jsonResponse(400, ['error' => 'Missing deviceId']); break; }
        $data = readData();
        if (!isset($data[$deviceId])) {
            jsonResponse(404, ['error' => 'Device not found']);
            break;
        }
        unset($data[$deviceId]);
        writeData($data);
        jsonResponse(200, ['success' => true]);
        break;

    default:
        jsonResponse(400, ['error' => 'Unknown action']);
}
