require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const path = require('path');
const pool = require('./database');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'alltak_db',
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 8 * 60 * 60 * 1000
});

app.use(session({
    name: 'alltak.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Em produção com HTTPS, mudar para true.
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000
    }
}));

function usuarioPublico(usuario) {
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        cargo: usuario.cargo || usuario.perfil
    };
}

// Cadastro público: toda conta nova nasce como colaborador.
// Nunca aceite perfil admin/gestor enviado pelo navegador.
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Preencha nome, e-mail e senha.' });
        }
        if (String(senha).length < 8) {
            return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 8 caracteres.' });
        }

        const emailNormalizado = String(email).trim().toLowerCase();
        const senhaHash = await bcrypt.hash(String(senha), 12);
        const [resultado] = await pool.execute(
            'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
            [String(nome).trim(), emailNormalizado, senhaHash, 'colaborador']
        );

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
        }
        console.error('Erro no cadastro:', erro);
        return res.status(500).json({ mensagem: 'Erro interno ao cadastrar usuário.' });
    }
});

// Login: valida a senha e cria uma sessão armazenada no MySQL.
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
        }

        const [usuarios] = await pool.execute(
            'SELECT id, nome, email, senha, perfil FROM usuarios WHERE email = ? LIMIT 1',
            [String(email).trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        }

        const usuario = usuarios[0];
        const senhaValida = await bcrypt.compare(String(senha), usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        }

        // Evita fixação de sessão: gera um identificador novo após autenticar.
        req.session.regenerate((erro) => {
            if (erro) {
                console.error('Erro ao criar sessão:', erro);
                return res.status(500).json({ mensagem: 'Não foi possível iniciar a sessão.' });
            }

            req.session.usuario = usuarioPublico(usuario);
            req.session.save((erroSalvar) => {
                if (erroSalvar) {
                    console.error('Erro ao salvar sessão:', erroSalvar);
                    return res.status(500).json({ mensagem: 'Não foi possível salvar a sessão.' });
                }
                return res.json({
                    mensagem: 'Login realizado com sucesso!',
                    usuario: req.session.usuario
                });
            });
        });
    } catch (erro) {
        console.error('Erro no login:', erro);
        return res.status(500).json({ mensagem: 'Erro interno ao realizar login.' });
    }
});

// Consulta a sessão atual ao abrir ou atualizar o portal.
app.get('/api/auth/me', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autenticado.' });
    }
    return res.json({ usuario: req.session.usuario });
});

// Encerra a sessão no servidor e remove o cookie do navegador.
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            console.error('Erro ao encerrar sessão:', erro);
            return res.status(500).json({ mensagem: 'Não foi possível encerrar a sessão.' });
        }
        res.clearCookie('alltak.sid', { httpOnly: true, sameSite: 'lax', secure: false });
        return res.json({ mensagem: 'Sessão encerrada.' });
    });
});

// Impede que a pasta backend (incluindo .env) seja servida como arquivo público.
app.use('/backend', (req, res) => res.sendStatus(404));

// Serve os arquivos do portal pela mesma origem da API: http://localhost:3000
app.use(express.static(path.resolve(__dirname, '..'), {
    dotfiles: 'deny',
    index: 'index.html'
}));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'ALLTAK' }));

app.listen(PORT, () => {
    console.log(`ALLTAK disponível em http://localhost:${PORT}`);
});
