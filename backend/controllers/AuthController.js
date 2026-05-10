//exemplo de controller de autenticação

import jwt from 'jsonwebtoken';
import UsuarioModel from '../models/UsuarioModel.js';
import { JWT_CONFIG } from '../config/jwt.js';

class AuthController {
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Email e senha são obrigatórios',
        });
      }

      const usuario = await UsuarioModel.verificarCredenciais(email.trim().toLowerCase(), senha);  // Verifica as credenciais de login usando o método verificarCredenciais do modelo de usuário, que retorna os dados do usuário se as credenciais forem válidas ou null caso contrário

      if (!usuario) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Credenciais inválidas',
        });
      }

      const token = jwt.sign( // Gera um token JWT contendo os dados do usuário (exceto a senha) e as configurações de expiração definidas em JWT_CONFIG, usando a chave secreta para assinatura do token
        {
          id: usuario.id,
          email: usuario.email,
          tipo: usuario.tipo,
        },
        JWT_CONFIG.secret,
        { expiresIn: JWT_CONFIG.expiresIn }
      );

      res.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
        dados: {
          token,
          usuario,
        },
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }

  static async registrar(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nome, email e senha são obrigatórios',
        });
      }

      const usuarioExistente = await UsuarioModel.buscarPorEmail(email.trim().toLowerCase());
      if (usuarioExistente) {
        return res.status(409).json({
          sucesso: false,
          erro: 'Email já cadastrado',
        });
      }

      const id = await UsuarioModel.criar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        tipo: tipo || 'operador',
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário registrado com sucesso',
        dados: { id },
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }

  static async obterPerfil(req, res) {
    try {
      const usuario = await UsuarioModel.buscarPorId(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado',
        });
      }

      const { senha, ...usuarioSemSenha } = usuario;
      res.status(200).json({
        sucesso: true,
        dados: usuarioSemSenha,
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }
}

export default AuthController;