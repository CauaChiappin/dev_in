<?php // Inicia o código PHP

require_once '../config/database.php'; // Importa o arquivo da conexão com o banco

class UsuarioModel { // Cria a classe UsuarioModel

    public static function listarTodos() { // Método para listar todos os usuários

        global $pdo; // Usa a conexão PDO criada no database.php

        $sql = " // Variável contendo a query SQL

            SELECT // Seleciona colunas da tabela
                id_usuario, // ID do usuário
                nome, // Nome do usuário
                email, // Email do usuário
                telefone, // Telefone do usuário
                tipo, // Tipo do usuário
                criado_em // Data de criação
            FROM usuarios // Tabela usuarios
            ORDER BY nome ASC // Ordena pelo nome em ordem alfabética
        ";

        $stmt = $pdo->query($sql); // Executa a query SQL

        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Retorna todos os usuários em formato array
    }

    public static function buscarPorId($id) { // Método para buscar usuário pelo ID

        global $pdo; // Usa conexão global do banco

        $sql = " // Query SQL

            SELECT // Seleciona colunas
                id_usuario, // ID
                nome, // Nome
                email, // Email
                telefone, // Telefone
                tipo, // Tipo
                criado_em, // Data de criação
                senha // Senha criptografada
            FROM usuarios // Tabela usuarios
            WHERE id_usuario = ? // Busca pelo ID
        ";

        $stmt = $pdo->prepare($sql); // Prepara a query para segurança

        $stmt->execute([$id]); // Executa substituindo ? pelo ID

        return $stmt->fetch(PDO::FETCH_ASSOC); // Retorna um único usuário
    }

    public static function buscarPorEmail($email) { // Método para buscar usuário pelo email

        global $pdo; // Usa conexão do banco

        $sql = " // Query SQL

            SELECT // Seleciona colunas
                id_usuario, // ID
                nome, // Nome
                email, // Email
                telefone, // Telefone
                tipo, // Tipo
                criado_em, // Data
                senha // Senha
            FROM usuarios // Tabela
            WHERE email = ? // Busca pelo email
        ";

        $stmt = $pdo->prepare($sql); // Prepara query

        $stmt->execute([$email]); // Executa query

        return $stmt->fetch(PDO::FETCH_ASSOC); // Retorna usuário encontrado
    }

    public static function criar($dadosUsuario) { // Método para criar usuário

        global $pdo; // Usa conexão do banco

        $senhaHash = password_hash( // Criptografa senha
            $dadosUsuario['senha'], // Senha digitada
            PASSWORD_DEFAULT // Algoritmo seguro automático
        );

        $sql = " // Query INSERT

            INSERT INTO usuarios ( // Tabela usuarios
                nome, // Coluna nome
                email, // Coluna email
                telefone, // Coluna telefone
                senha, // Coluna senha
                tipo // Coluna tipo
            )
            VALUES (?, ?, ?, ?, ?) // Valores da inserção
        ";

        $stmt = $pdo->prepare($sql); // Prepara query

        $stmt->execute([ // Executa query

            $dadosUsuario['nome'], // Valor do nome

            $dadosUsuario['email'], // Valor do email

            $dadosUsuario['telefone'] ?? null, // Telefone ou null

            $senhaHash, // Senha criptografada

            $dadosUsuario['tipo'] ?? 'operador' // Tipo ou operador
        ]);

        return $pdo->lastInsertId(); // Retorna ID criado
    }

    public static function atualizar($id, $dadosUsuario) { // Atualiza usuário

        global $pdo; // Usa conexão do banco

        $campos = []; // Array dos campos SQL

        $valores = []; // Array dos valores SQL

        if (isset($dadosUsuario['nome'])) { // Verifica nome

            $campos[] = "nome = ?"; // Adiciona campo SQL

            $valores[] = $dadosUsuario['nome']; // Adiciona valor
        }

        if (isset($dadosUsuario['email'])) { // Verifica email

            $campos[] = "email = ?"; // Campo SQL

            $valores[] = $dadosUsuario['email']; // Valor email
        }

        if (isset($dadosUsuario['telefone'])) { // Verifica telefone

            $campos[] = "telefone = ?"; // Campo SQL

            $valores[] = $dadosUsuario['telefone']; // Valor telefone
        }

        if (isset($dadosUsuario['tipo'])) { // Verifica tipo

            $campos[] = "tipo = ?"; // Campo SQL

            $valores[] = $dadosUsuario['tipo']; // Valor tipo
        }

        if (isset($dadosUsuario['senha'])) { // Verifica senha

            $senhaHash = password_hash( // Criptografa senha
                $dadosUsuario['senha'], // Nova senha
                PASSWORD_DEFAULT // Algoritmo padrão
            );

            $campos[] = "senha = ?"; // Campo senha

            $valores[] = $senhaHash; // Valor senha criptografada
        }

        if (empty($campos)) { // Se nenhum campo foi enviado

            return 0; // Não atualiza nada
        }

        $valores[] = $id; // Adiciona ID no final

        $sql = " // Query UPDATE

            UPDATE usuarios // Tabela usuarios

            SET " . implode(', ', $campos) . " // Junta campos automaticamente

            WHERE id_usuario = ? // Atualiza pelo ID
        ";

        $stmt = $pdo->prepare($sql); // Prepara query

        $stmt->execute($valores); // Executa query

        return $stmt->rowCount(); // Retorna linhas alteradas
    }

    public static function excluir($id) { // Método excluir usuário

        global $pdo; // Usa conexão do banco

        $sql = " // Query DELETE

            DELETE FROM usuarios // Remove da tabela usuarios

            WHERE id_usuario = ? // Remove pelo ID
        ";

        $stmt = $pdo->prepare($sql); // Prepara query

        $stmt->execute([$id]); // Executa query

        return $stmt->rowCount(); // Retorna linhas removidas
    }

    public static function verificarCredenciais($email, $senha) { // Método login

        $usuario = self::buscarPorEmail($email); // Busca usuário pelo email

        if (!$usuario) { // Se usuário não existir

            return null; // Retorna null
        }

        $senhaValida = password_verify( // Verifica senha
            $senha, // Senha digitada
            $usuario['senha'] // Senha criptografada
        );

        if (!$senhaValida) { // Se senha estiver errada

            return null; // Retorna null
        }

        return [ // Retorna dados do usuário

            'id' => $usuario['id_usuario'], // ID do usuário

            'nome' => $usuario['nome'], // Nome

            'email' => $usuario['email'], // Email

            'telefone' => $usuario['telefone'], // Telefone

            'tipo' => $usuario['tipo'] // Tipo
        ];
    }
}