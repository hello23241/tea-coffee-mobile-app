<?php
require_once "db.php";

// Đọc dữ liệu JSON gửi lên từ React Native
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!$data || !isset($data['orderCode']) || !isset($data['items'])) {
    echo json_encode(["status" => "error", "message" => "Dữ liệu không hợp lệ"]);
    exit;
}

$orderCode = $data['orderCode'];
$totalAmount = $data['totalAmount'];
$items = $data['items'];

try {
    // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
    $conn->beginTransaction();

    // 1. Thêm vào bảng orders
    $stmtOrder = $conn->prepare("INSERT INTO orders (order_code, total_amount) VALUES (?, ?)");
    $stmtOrder->execute([$orderCode, $totalAmount]);
    $orderId = $conn->lastInsertId();

    // 2. Thêm từng món vào bảng order_details
    $stmtDetail = $conn->prepare("
        INSERT INTO order_details (order_id, product_name, size, toppings, quantity, unit_price) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    foreach ($items as $item) {
        $toppingsText = "";
        if (!empty($item['toppings'])) {
            $toppingsText = implode(", ", array_column($item['toppings'], 'name'));
        }

        $stmtDetail->execute([
            $orderId,
            $item['name'],
            $item['size']['name'],
            $toppingsText,
            $item['quantity'],
            $item['unitPrice']
        ]);
    }

    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Đặt hàng thành công",
        "order_id" => $orderId
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . $e->getMessage()]);
}
?>