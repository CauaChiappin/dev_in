<?php

// Endereço do banco
// localhost = seu próprio computador
$host = "localhost";

// Nome do banco criado no phpMyAdmin
$dbname = "meubanco";

// Usuário padrão do XAMPP
$user = "root";

// Senha padrão do XAMPP é vazia
$pass = "";

// Tenta conectar no banco
try {

    // Cria conexão PDO
    $pdo = new PDO(

        // mysql = tipo do banco
        // host = endereço
        // dbname = nome do banco
        // charset=utf8 = suporta acentos
        "mysql:host=$host;dbname=$dbname;charset=utf8",

        // usuário
        $user,

        // senha
        $pass
    );

    // Faz o PHP mostrar erros do banco
    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    echo "Conectado com sucesso!";

} catch (PDOException $e) {

    // Mostra erro caso falhe
    die("Erro na conexão: " . $e->getMessage());
}