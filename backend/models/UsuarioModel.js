// Exemplo de modelo de usuário usando Sequelize

import bcrypt from 'bcryptjs'; // Deixa as senhas mais seguras
import { execute, query } from '../config/database.js'; // Funções para executar queries no banco de dados

class UsuarioModel { // Modelo de usuário para interagir com a tabela 'usuarios'
  static async listarTodos() {
    return query(
      `SELECT id_usuario, nome, email, telefone, tipo, criado_em
       FROM usuarios
       ORDER BY nome ASC`
    );
  }

  static async listarClientes() {   // Método específico para listar apenas clientes
    return query(
      `SELECT id_usuario, nome, email, telefone, tipo, criado_em
       FROM usuarios
       WHERE tipo = 'cliente'
       ORDER BY nome ASC`
    );
  }

  static async buscarPorId(id) { // Método para buscar um usuário por ID
    const rows = await query(
      `SELECT id_usuario, nome, email, telefone, tipo, criado_em, senha
       FROM usuarios
       WHERE id_usuario = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async buscarClientePorId(id) { // Método para buscar um cliente por ID, garantindo que o tipo seja 'cliente'
    const rows = await query(
      `SELECT id_usuario, nome, email, telefone, tipo, criado_em, senha
       FROM usuarios
       WHERE id_usuario = ? AND tipo = 'cliente'`,
      [id]
    );
    return rows[0] || null;
  }

  static async buscarPorEmail(email) { // Método para buscar um usuário por email, útil para autenticação
    const rows = await query(
      `SELECT id_usuario, nome, email, telefone, tipo, criado_em, senha
       FROM usuarios
       WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  static async criar(dadosUsuario) { // Método para criar um novo usuário, incluindo hash da senha para segurança
    const senhaHash = await bcrypt.hash(dadosUsuario.senha, 10); 
    const result = await execute(  // Insere um novo usuário no banco de dados
      `INSERT INTO usuarios (nome, email, telefone, senha, tipo)
       VALUES (?, ?, ?, ?, ?)`,
      [ // Os valores são passados em ordem, correspondendo aos campos da tabela
        dadosUsuario.nome,
        dadosUsuario.email,
        dadosUsuario.telefone || null,
        senhaHash,
        dadosUsuario.tipo || 'operador',
      ]
    );

    return result.insertId; // Retorna o ID do usuário recém-criado para referência futura
  }

  static async atualizar(id, dadosUsuario) { // Método para atualizar um usuário existente, permitindo atualização parcial dos campos
    const campos = [];
    const valores = [];

    if (dadosUsuario.nome !== undefined) { // Verifica se o campo 'nome' foi fornecido para atualização
      campos.push('nome = ?');
      valores.push(dadosUsuario.nome);
    }

    if (dadosUsuario.email !== undefined) { // Verifica se o campo 'email' foi fornecido para atualização
      campos.push('email = ?');
      valores.push(dadosUsuario.email); // Permite atualizar o email, mas deve ser tratado com cuidado para evitar conflitos de email duplicado em outros lugares do código (ex: validação prévia no controller)
    }

    if (dadosUsuario.telefone !== undefined) { // Verifica se o campo 'telefone' foi fornecido para atualização
      campos.push('telefone = ?');
      valores.push(dadosUsuario.telefone || null); // Permite definir telefone como null se for uma string vazia ou undefined
    }

    if (dadosUsuario.tipo !== undefined) {
      campos.push('tipo = ?');
      valores.push(dadosUsuario.tipo);
    }

    if (dadosUsuario.senha !== undefined) { // Verifica se o campo 'senha' foi fornecido para atualização, e se sim, gera um hash da nova senha antes de atualizar no banco de dados
      const senhaHash = await bcrypt.hash(dadosUsuario.senha, 10); // Gera um hash da nova senha para segurança
      campos.push('senha = ?'); // Adiciona o campo de senha à lista de campos a serem atualizados
      valores.push(senhaHash); // Adiciona o hash da nova senha à lista de valores a serem atualizados, garantindo que a senha seja armazenada de forma segura no banco de dados
    }

    if (!campos.length) { // Se nenhum campo foi fornecido para atualização, retorna 0 para indicar que nenhuma atualização foi realizada
      return 0;
    }

    valores.push(id); // Adiciona o ID do usuário ao final dos valores para a cláusula WHERE da query de atualização
    const result = await execute(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id_usuario = ?`, // 
      valores
    );
    return result.affectedRows; // Retorna o número de linhas afetadas pela atualização, útil para verificar se a atualização foi bem-sucedida ou se o usuário não foi encontrado
  }

  static async excluir(id) { 
    const result = await execute('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    return result.affectedRows;
  }
  
  static async verificarCredenciais(email, senha) { // Método para verificar as credenciais de login, comparando o email e a senha fornecidos com os registros do banco de dados
    const usuario = await this.buscarPorEmail(email); // Busca o usuário pelo email para obter os dados, incluindo a senha hash armazenada no banco de dados

    if (!usuario) {
      return null;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha); // Compara a senha fornecida com o hash armazenado no banco de dados usando bcrypt, retornando true se a senha for válida e false caso contrário
    if (!senhaValida) {
      return null;
    }

    return {    // Se as credenciais forem válidas, retorna um objeto contendo os dados do usuário, mas sem a senha para segurança
      id: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      tipo: usuario.tipo,
    };
  }
}

export default UsuarioModel; // Exporta a classe UsuarioModel para que possa ser utilizada em outras partes do código, como nos controllers para manipular os dados dos usuários e realizar operações de CRUD (Create, Read, Update, Delete) no banco de dados.