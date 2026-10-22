<?php
require_once "db.php";

try {
    // 1. Lấy danh sách sản phẩm
    $stmtProducts = $conn->query("SELECT id, category_name AS category, name, base_price AS basePrice, image_url AS image, description FROM products");
    $products = $stmtProducts->fetchAll(PDO::FETCH_ASSOC);

    // Chuyển kiểu basePrice về Number
    foreach ($products as &$p) {
        $p['id'] = (int)$p['id'];
        $p['basePrice'] = (float)$p['basePrice'];
    }

    // 2. Lấy danh sách topping
    $stmtToppings = $conn->query("SELECT id, name, price FROM toppings");
    $toppings = $stmtToppings->fetchAll(PDO::FETCH_ASSOC);
    foreach ($toppings as &$t) {
        $t['id'] = (string)$t['id'];
        $t['price'] = (float)$t['price'];
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "products" => $products,
            "toppings" => $toppings
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>