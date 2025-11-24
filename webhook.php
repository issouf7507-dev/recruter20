<?php
// Webhook pour déclencher le déploiement automatique
// À placer sur votre serveur VPSd

// Configuration
$secret = 'votre_secret_webhook'; // Changez ceci
$project_dir = '/var/www/webapp/recruter';
$deploy_script = $project_dir . '/deploy.sh';

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Méthode non autorisée');
}

// Récupérer le payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Vérifier la signature (optionnel mais recommandé)
if (!empty($secret)) {
    $expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($expected_signature, $signature)) {
        http_response_code(401);
        die('Signature invalide');
    }
}

// Décoder le payload JSON
$data = json_decode($payload, true);

// Vérifier que c'est un push sur la branche dev-issouf
if ($data['ref'] !== 'refs/heads/dev-issouf') {
    http_response_code(200);
    die('Pas un push sur dev-issouf');
}

// Logger l'événement
$log_file = $project_dir . '/deploy.log';
$log_entry = date('Y-m-d H:i:s') . " - Déploiement déclenché par push sur main\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

// Exécuter le script de déploiement en arrière-plan
$command = "cd $project_dir && bash deploy.sh > deploy.log 2>&1 &";
exec($command);

// Répondre avec succès
http_response_code(200);
echo json_encode(['status' => 'success', 'message' => 'Déploiement déclenché']);
?> 