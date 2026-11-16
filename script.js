tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: {
                            900: '#060d17',
                            800: '#0a192f',
                            700: '#112240',
                            600: '#1d3557',
                        },
                        neon: {
                            blue: '#00d2ff',
                            royal: '#0056b3',
                            cyan: '#00f2fe',
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    boxShadow: {
                        'neon': '0 0 15px rgba(0, 210, 255, 0.4)',
                        'neon-lg': '0 0 25px rgba(0, 210, 255, 0.6)',
                    }
                }
            }
        }

// ==========================================
        // INITIAL STATE & LOCAL STORAGE PERSISTENCE
        // ==========================================
        const initialData = {
            users: [
                { id: '1', name: 'Administrador Sistema', email: 'admin@alltak.com', role: 'admin', cargo: 'Tech Lead / Admin', status: 'Ativo' },
                { id: '2', name: 'Carlos Eduardo', email: 'gestor@alltak.com', role: 'gestor', cargo: 'Gestor de Operações', status: 'Ativo' },
                { id: '3', name: 'Ana Silva', email: 'ana@alltak.com', role: 'colaborador', cargo: 'Desenvolvedora Pleno', cargoAlvo: 'Tech Lead Sênior', interesse: 'Foco em arquitetura de microsserviços e liderança de times ágeis.', status: 'Ativo' },
                { id: '4', name: 'Bruno Souza', email: 'bruno@alltak.com', role: 'colaborador', cargo: 'Analista de QA', cargoAlvo: 'QA Lead', interesse: 'Automação de testes e CI/CD.', status: 'Ativo' }
            ],
            courses: [
                { id: 'c1', title: 'Liderança Híbrida e Gestão de Equipes', roleTarget: 'gestor', duration: '40h', level: 'Avançado', description: 'Metodologias modernas para gestão remota, engajamento e OKRs.' },
                { id: 'c2', title: 'Comunicação Assertiva e Feedback 360°', roleTarget: 'gestor', duration: '20h', level: 'Intermediário', description: 'Técnicas de mentoria, alinhamento de expectativas e escuta ativa.' },
                { id: 'c3', title: 'Arquitetura de Software Cloud Native', roleTarget: 'colaborador', duration: '60h', level: 'Avançado', description: 'Containers, Kubernetes, Serverless e microserviços em alta escala.' },
                { id: 'c4', title: 'Gestão Ágil com Scrum & Kanban', roleTarget: 'colaborador', duration: '30h', level: 'Iniciante', description: 'Fundamentos de agilidade, cerimonias e facilitação de entregas.' },
                { id: 'c5', title: 'Inteligência Artificial Aplicada a Negócios', roleTarget: 'todos', duration: '25h', level: 'Intermediário', description: 'Prompt Engineering, automação de fluxos e LLMs corporativas.' }
            ],
            relatorios: [
                { colabId: '3', courseId: 'c3', progress: 100, status: 'Concluído' },
                { colabId: '3', courseId: 'c4', progress: 75, status: 'Em Andamento' },
                { colabId: '4', courseId: 'c4', progress: 100, status: 'Concluído' },
                { colabId: '4', courseId: 'c5', progress: 30, status: 'Em Andamento' }
            ],
            atas: [
                { id: 'a1', titulo: 'Alinhamento Estratégico Q4', data: '2026-10-15T14:30', prioridade: 'Alta', presentes: 'Carlos Eduardo, Ana Silva, Bruno Souza', decisoes: 'Aprovada a transição do módulo de relatórios para arquitetura desacoplada.', compromissos: 'Ana entrega prova de conceito até 25/10.', proxima: '2026-11-02' }
            ],
            feedbacks: [
                { id: 'f1', colabId: '3', colabNome: 'Ana Silva', positivos: 'Excelente entrega na API de autenticação. Proatividade exemplar.', melhorias: 'Pode melhorar na documentação técnica prévia.', competencias: 'Node.js, Docker, Proatividade', planoAcao: 'Realizar curso de documentação e OpenAPI até dia 30/10.', reconhecimento: 'Insignia de Agilidade Q3' }
            ],
            pdi: {
                colabId: '3',
                done: [
                    'Certificação Cloud Architect concluída',
                    'Apresentação técnica para o time conduzida com sucesso',
                    'Code Review semanal com notas acima de 9/10'
                ],
                pending: [
                    'Concluir curso de Liderança Técnica (75%)',
                    'Mentorar 1 desenvolvedor júnior no trimestre',
                    'Apresentar proposta de otimização da pipeline CI/CD'
                ]
            },
            projects: [
                { id: 'p1', name: 'Squad Redesenho do Portal ALLTAK', roleNeeded: 'Frontend Master / Tailwind', duration: '3 meses', desc: 'Projeto estratégico para unificação de UX dos módulos corporativos.' },
                { id: 'p2', name: 'Migração de Banco para PostgreSQL Global', roleNeeded: 'Database Specialist', duration: '2 meses', desc: 'Otimização de índices e alta disponibilidade de dados.' }
            ]
        };

        // Load DB or set Defaults
        function loadDB() {
            const data = localStorage.getItem('ALLTAK_DB');
            if (!data) {
                localStorage.setItem('ALLTAK_DB', JSON.stringify(initialData));
                return initialData;
            }
            return JSON.parse(data);
        }

        function saveDB(data) {
            localStorage.setItem('ALLTAK_DB', JSON.stringify(data));
        }

        let db = loadDB();
        let currentUser = null;
        let activeTab = 'tab1';

        // ==========================================
        // UI HELPERS & TOAST
        // ==========================================
        function showToast(message) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = 'pointer-events-auto bg-navy-800 border-l-4 border-neon-blue text-white px-4 py-3 rounded-xl shadow-neon flex items-center gap-3 transition-all duration-300 transform translate-x-10 opacity-0';
            toast.innerHTML = `<i class="fa-solid fa-circle-check text-neon-blue text-lg"></i> <span class="text-xs font-semibold">${message}</span>`;
            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.remove('translate-x-10', 'opacity-0');
            }, 50);

            setTimeout(() => {
                toast.classList.add('translate-x-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        // ==========================================
        // AUTH & MODALS
        // ==========================================
        function openLoginModal(role) {
            const modal = document.getElementById('loginModal');
            const title = document.getElementById('modalRoleTitle');
            const roleInput = document.getElementById('loginRoleInput');
            const userInput = document.getElementById('loginUser');
            const passInput = document.getElementById('loginPass');
            const securityGroup = document.getElementById('securityCodeGroup');
            const securityInput = document.getElementById('loginSecurityCode');

            // Sempre abrir o formulário de login vazio
            userInput.value = '';
            passInput.value = '';
            securityInput.value = '';
            // O código de CPF era apenas uma simulação visual; autenticação real usa a senha do banco.
            securityGroup.classList.add('hidden');
            securityInput.required = false;

            roleInput.value = role;
            if (role === 'admin') {
                title.innerText = 'Login de Administrador';
                userInput.value = '';
            } else if (role === 'gestor') {
                title.innerText = 'Login de Gestor';
                userInput.value = '';
            } else {
                title.innerText = 'Login de Colaborador';
                userInput.value = '';
            }
            modal.classList.remove('hidden');
        }

        function closeLoginModal() {
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('loginUser').value = '';
            document.getElementById('loginPass').value = '';
            document.getElementById('loginSecurityCode').value = '';
        }

        async function handleLogin(e) {
            e.preventDefault();

            const email = document.getElementById('loginUser').value.trim();
            const senha = document.getElementById('loginPass').value;

            try {
                const resposta = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ email, senha })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    showToast(dados.mensagem || 'Não foi possível entrar.');
                    return;
                }

                // O perfil vem do banco; nunca confiamos no perfil escolhido na tela.
                currentUser = {
                    id: String(dados.usuario.id),
                    name: dados.usuario.nome,
                    email: dados.usuario.email,
                    role: dados.usuario.perfil,
                    cargo: dados.usuario.cargo || dados.usuario.perfil,
                    status: 'Ativo'
                };

                closeLoginModal();
                showDashboard();
                showToast('Login realizado com sucesso!');
            } catch (erro) {
                console.error('Erro no login:', erro);
                showToast('Não foi possível conectar ao servidor ALLTAK.');
            }
        }


        function openRegisterModal() {
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('registerModal').classList.remove('hidden');
        }

        function closeRegisterModal() {
            document.getElementById('registerModal').classList.add('hidden');
        }

        async function handleRegister(e) {
            e.preventDefault();

            const nome = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const senha = document.getElementById('registerPassword').value;

            try {
                const resposta = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ nome, email, senha })
                });
                const dados = await resposta.json();

                if (!resposta.ok) {
                    showToast(dados.mensagem || 'Não foi possível criar a conta.');
                    return;
                }

                // Após cadastrar, autentica a conta recém-criada.
                const loginResposta = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ email, senha })
                });
                const loginDados = await loginResposta.json();

                if (!loginResposta.ok) {
                    showToast('Conta criada. Faça login para continuar.');
                    closeRegisterModal();
                    openLoginModal('colaborador');
                    document.getElementById('loginUser').value = email;
                    return;
                }

                currentUser = {
                    id: String(loginDados.usuario.id),
                    name: loginDados.usuario.nome,
                    email: loginDados.usuario.email,
                    role: loginDados.usuario.perfil,
                    cargo: loginDados.usuario.cargo || loginDados.usuario.perfil,
                    status: 'Ativo'
                };
                closeRegisterModal();
                document.getElementById('registerName').value = '';
                document.getElementById('registerEmail').value = '';
                document.getElementById('registerPassword').value = '';
                showDashboard();
                showToast('Conta criada com sucesso!');
            } catch (erro) {
                console.error('Erro no cadastro:', erro);
                showToast('Não foi possível conectar ao servidor ALLTAK.');
            }
        }

        async function logout() {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                });
            } catch (erro) {
                console.error('Erro ao encerrar sessão:', erro);
            }

            currentUser = null;
            showLanding();
        }

        function showDashboard() {
            const landing = document.getElementById('loginScreen');
            const dashboard = document.getElementById('dashboardScreen');

            // Alterna as telas explicitamente: evita conflito entre CSS customizado e Tailwind.
            if (landing) {
                landing.classList.add('hidden');
                landing.style.setProperty('display', 'none', 'important');
            }
            if (dashboard) {
                dashboard.classList.remove('hidden');
                dashboard.style.setProperty('display', 'flex', 'important');
            }

            if (currentUser) {
                setupDashboardHeader();
                renderTabsForRole(currentUser.role);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function showLanding() {
            const landing = document.getElementById('loginScreen');
            const dashboard = document.getElementById('dashboardScreen');

            if (dashboard) {
                dashboard.classList.add('hidden');
                dashboard.style.setProperty('display', 'none', 'important');
            }
            if (landing) {
                landing.classList.remove('hidden');
                landing.style.removeProperty('display');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function setupDashboardHeader() {
            document.getElementById('loggedUserName').innerText = currentUser.name;
            document.getElementById('loggedUserRole').innerText = currentUser.cargo || currentUser.role;
            document.getElementById('roleBadge').innerText = currentUser.role.toUpperCase();
            
            const initials = currentUser.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
            document.getElementById('userInitials').innerText = initials;
        }

        // ==========================================
        // TAB RENDER & ROUTING
        // ==========================================
        function renderTabsForRole(role) {
            const container = document.getElementById('navTabContainer');
            container.innerHTML = '';

            document.getElementById('adminView').classList.add('hidden');
            document.getElementById('gestorView').classList.add('hidden');
            document.getElementById('colaboradorView').classList.add('hidden');

            let tabs = [];

            if (role === 'admin') {
                document.getElementById('adminView').classList.remove('hidden');
                tabs = [
                    { id: 'adminTab1', label: 'Gestão de Usuários', icon: 'fa-users' },
                    { id: 'adminTab2', label: 'Catálogo & Cursos Global', icon: 'fa-book-open' }
                ];
                renderAdminUsers();
                renderAdminCourses();
            } else if (role === 'gestor') {
                document.getElementById('gestorView').classList.remove('hidden');
                tabs = [
                    { id: 'gestorTab1', label: 'Cursos para Gestores', icon: 'fa-graduation-cap' },
                    { id: 'gestorTab2', label: 'Relatório do Curso', icon: 'fa-chart-pie' },
                    { id: 'gestorTab3', label: 'Ata de Reuniões e Eventos', icon: 'fa-clipboard-list' },
                    { id: 'gestorTab4', label: 'Feedbacks 360°', icon: 'fa-comments' },
                    { id: 'gestorTab5', label: 'Carreira e Sucessão', icon: 'fa-diagram-project' },
                    { id: 'integrityTab', label: 'Integridade & Ética', icon: 'fa-shield-halved' }
                ];
                renderGestorCourses();
                renderRelatorioCursos();
                renderAtas();
                renderFeedbacksGestor();
                renderSucessao();
                initFeedbackChart();
            } else {
                document.getElementById('colaboradorView').classList.remove('hidden');
                tabs = [
                    { id: 'colabTab1', label: 'Perfil & Objetivos', icon: 'fa-id-card' },
                    { id: 'colabTab2', label: 'Plano de Carreira', icon: 'fa-road' },
                    { id: 'colabTab3', label: 'Cursos & Treinamentos', icon: 'fa-laptop-code' },
                    { id: 'colabTab4', label: 'Projetos Internos', icon: 'fa-cubes' },
                    { id: 'colabTab5', label: 'Feedbacks & Mentorias', icon: 'fa-comments' },
                    { id: 'colabTab6', label: 'Progresso PDI', icon: 'fa-list-check' },
                    { id: 'colabTab7', label: 'Editar Perfil', icon: 'fa-user-pen' },
                    { id: 'integrityTab', label: 'Integridade & Ética', icon: 'fa-shield-halved' }
                ];
                renderColabPerfil();
                renderColabTrilhas();
                renderColabCursos();
                renderColabProjetos();
                renderColabFeedbacks();
                renderColabPDI();
            }

            tabs.forEach((tab, index) => {
                const btn = document.createElement('button');
                btn.onclick = () => switchTab(tab.id, role);
                btn.id = `navBtn_${tab.id}`;
                btn.className = `px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
                    index === 0 ? 'text-neon-blue border-neon-blue' : 'text-gray-400 border-transparent hover:text-white'
                }`;
                btn.innerHTML = `<i class="fa-solid ${tab.icon}"></i> ${tab.label}`;
                container.appendChild(btn);
            });

            // Trigger first tab
            switchTab(tabs[0].id, role);
        }

        function switchTab(tabId, role) {
            const roleContainer = document.getElementById(`${role}View`);
            const integrityView = document.getElementById('integrityView');

            if (tabId === 'integrityTab') {
                roleContainer.classList.add('hidden');
                integrityView.classList.remove('hidden');
            } else {
                integrityView.classList.add('hidden');
                roleContainer.classList.remove('hidden');
                roleContainer.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
                const target = document.getElementById(tabId);
                if (target) target.classList.remove('hidden');
            }

            const navBtns = document.querySelectorAll('#navTabContainer button');
            navBtns.forEach(btn => {
                if (btn.id === `navBtn_${tabId}`) {
                    btn.className = 'px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 text-neon-blue border-neon-blue';
                } else {
                    btn.className = 'px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 text-gray-400 border-transparent hover:text-white';
                }
            });
        }

        function submitEthicsReport(event) {
            event.preventDefault();
            const anonymous = document.getElementById('ethicsAnonymous').checked;
            const protocol = 'ET-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const box = document.getElementById('ethicsProtocol');
            box.textContent = `Relato registrado apenas nesta demonstração. Protocolo ilustrativo: ${protocol}. ${anonymous ? 'A opção anônima foi marcada no formulário, mas não há anonimato técnico garantido.' : 'Nenhum envio para uma equipe real foi realizado.'}`;
            box.classList.remove('hidden');
            document.getElementById('ethicsForm').reset();
            document.getElementById('ethicsIdentityFields').classList.remove('hidden');
        }

        document.addEventListener('DOMContentLoaded', async () => {
            // Confere no backend se existe uma sessão válida no navegador.
            try {
                const resposta = await fetch('/api/auth/me', {
                    credentials: 'same-origin'
                });

                if (resposta.ok) {
                    const dados = await resposta.json();
                    currentUser = {
                        id: String(dados.usuario.id),
                        name: dados.usuario.nome,
                        email: dados.usuario.email,
                        role: dados.usuario.perfil,
                        cargo: dados.usuario.cargo || dados.usuario.perfil,
                        status: 'Ativo'
                    };
                    showDashboard();
                } else {
                    showLanding();
                }
            } catch (erro) {
                console.error('Backend ALLTAK indisponível:', erro);
                showLanding();
                showToast('Backend indisponível. Inicie o servidor para entrar.');
            }

            const anonymousToggle = document.getElementById('ethicsAnonymous');
            if (anonymousToggle) {
                anonymousToggle.addEventListener('change', () => {
                    document.getElementById('ethicsIdentityFields').classList.toggle('hidden', anonymousToggle.checked);
                });
            }
        });

        // ==========================================
        // ADMIN FUNCTIONS
        // ==========================================
        function renderAdminUsers() {
            const tbody = document.getElementById('adminUsersTable');
            tbody.innerHTML = db.users.map(u => `
                <tr class="hover:bg-navy-700/50 transition-colors">
                    <td class="p-4 font-bold text-white">${u.name}</td>
                    <td class="p-4 text-gray-400">${u.email}</td>
                    <td class="p-4"><span class="px-2 py-1 bg-navy-900 border border-neon-blue/30 text-neon-blue rounded-md text-xs font-bold uppercase">${u.role}</span></td>
                    <td class="p-4">${u.cargo || '-'}</td>
                    <td class="p-4"><span class="text-emerald-400 text-xs font-bold">● ${u.status}</span></td>
                    <td class="p-4 text-right">
                        <button onclick="deleteUser('${u.id}')" class="text-rose-400 hover:text-rose-300 p-1"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        function deleteUser(id) {
            db.users = db.users.filter(u => u.id !== id);
            saveDB(db);
            renderAdminUsers();
            showToast('Usuário removido.');
        }

        function openUserModal() {
            const name = prompt("Nome Completo:");
            if (!name) return;
            const email = prompt("E-mail corporativo:");
            if (!email) return;
            const role = prompt("Perfil (admin, gestor, colaborador):", "colaborador");
            const cargo = prompt("Cargo Atual:", "Analista");

            db.users.push({
                id: Date.now().toString(),
                name, email, role: role || 'colaborador', cargo: cargo || 'Colaborador', status: 'Ativo'
            });
            saveDB(db);
            renderAdminUsers();
            showToast('Novo colaborador cadastrado com sucesso!');
        }

        function renderAdminCourses() {
            const grid = document.getElementById('adminCoursesGrid');
            grid.innerHTML = db.courses.map(c => `
                <div class="glass-panel p-5 rounded-2xl border border-navy-700 space-y-3">
                    <div class="flex justify-between items-start">
                        <span class="text-xs px-2 py-0.5 rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/30 font-bold uppercase">${c.roleTarget}</span>
                        <span class="text-xs text-gray-400"><i class="fa-solid fa-clock"></i> ${c.duration}</span>
                    </div>
                    <h4 class="text-base font-bold text-white">${c.title}</h4>
                    <p class="text-xs text-gray-400">${c.description}</p>
                </div>
            `).join('');
        }

        function openCourseModal() {
            const title = prompt("Título do Curso:");
            if (!title) return;
            const roleTarget = prompt("Público-alvo (gestor, colaborador, todos):", "todos");
            const duration = prompt("Carga Horária (ex: 30h):", "30h");
            const description = prompt("Descrição resumida:");

            db.courses.push({
                id: 'c' + Date.now(),
                title, roleTarget: roleTarget || 'todos', duration: duration || '20h', level: 'Intermediário', description: description || 'Sem descrição.'
            });
            saveDB(db);
            renderAdminCourses();
            showToast('Novo curso cadastrado!');
        }

        // ==========================================
        // GESTOR FUNCTIONS
        // ==========================================
        function renderGestorCourses() {
            const grid = document.getElementById('gestorCoursesGrid');
            const gestorCourses = db.courses.filter(c => c.roleTarget === 'gestor' || c.roleTarget === 'todos');
            
            grid.innerHTML = gestorCourses.map(c => `
                <div class="glass-panel p-6 rounded-2xl border border-navy-700 hover:border-neon-blue/50 transition-all space-y-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs text-neon-blue font-bold uppercase">${c.level}</span>
                            <span class="text-xs text-gray-400"><i class="fa-solid fa-clock"></i> ${c.duration}</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">${c.title}</h3>
                        <p class="text-xs text-gray-400 leading-relaxed">${c.description}</p>
                    </div>
                    <button onclick="showToast('Inscrição confirmada no curso de Liderança!')" class="w-full py-2.5 bg-navy-700 hover:bg-neon-blue hover:text-navy-900 text-neon-blue font-bold rounded-xl transition-colors text-xs uppercase tracking-wider">
                        Acessar Treinamento
                    </button>
                </div>
            `).join('');
        }

        function renderRelatorioCursos() {
            const selectFilter = document.getElementById('filterRelatorioColab');
            const filterVal = selectFilter.value;

            // Populate options if empty
            if (selectFilter.options.length <= 1) {
                db.users.filter(u => u.role === 'colaborador').forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.id;
                    opt.innerText = u.name;
                    selectFilter.appendChild(opt);
                });
            }

            const tbody = document.getElementById('gestorRelatorioTable');
            let list = db.relatorios;
            if (filterVal !== 'ALL') {
                list = list.filter(r => r.colabId === filterVal);
            }

            tbody.innerHTML = list.map(r => {
                const user = db.users.find(u => u.id === r.colabId) || { name: 'Colaborador' };
                const course = db.courses.find(c => c.id === r.courseId) || { title: 'Curso Desconhecido', duration: '20h' };
                return `
                    <tr class="hover:bg-navy-700/50 transition-colors">
                        <td class="p-4 font-bold text-white">${user.name}</td>
                        <td class="p-4 text-gray-300">${course.title}</td>
                        <td class="p-4 text-gray-400">${course.duration}</td>
                        <td class="p-4 w-48">
                            <div class="flex items-center gap-2">
                                <div class="w-full bg-navy-900 rounded-full h-2 overflow-hidden">
                                    <div class="bg-neon-blue h-full" style="width: ${r.progress}%"></div>
                                </div>
                                <span class="text-xs font-bold text-white">${r.progress}%</span>
                            </div>
                        </td>
                        <td class="p-4">
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
                                ${r.status}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function handleSaveAta(e) {
            e.preventDefault();
            const newAta = {
                id: 'a' + Date.now(),
                titulo: document.getElementById('ataTitulo').value,
                data: document.getElementById('ataData').value,
                prioridade: document.getElementById('ataPrioridade').value,
                presentes: document.getElementById('ataPresentes').value,
                decisoes: document.getElementById('ataDecisoes').value,
                compromissos: document.getElementById('ataCompromissos').value,
                proxima: document.getElementById('ataProxima').value
            };

            db.atas.unshift(newAta);
            saveDB(db);
            renderAtas();
            e.target.reset();
            showToast('Ata de reunião registrada com sucesso!');
        }

        function renderAtas() {
            const container = document.getElementById('atasListContainer');
            container.innerHTML = db.atas.map(a => `
                <div class="glass-panel p-5 rounded-2xl border border-navy-700 space-y-3">
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-navy-700 pb-3">
                        <div>
                            <h4 class="text-base font-bold text-white">${a.titulo}</h4>
                            <span class="text-xs text-gray-400"><i class="fa-regular fa-calendar"></i> ${new Date(a.data).toLocaleString()}</span>
                        </div>
                        <span class="px-2.5 py-1 rounded-md text-xs font-bold w-fit ${
                            a.prioridade === 'Alta' ? 'bg-rose-500/20 text-rose-400' : 'bg-neon-blue/20 text-neon-blue'
                        }">Prioridade: ${a.prioridade}</span>
                    </div>
                    <div class="text-xs text-gray-300 space-y-2">
                        <div><strong class="text-gray-400">Presentes:</strong> ${a.presentes}</div>
                        <div><strong class="text-gray-400">Decisões:</strong> ${a.decisoes}</div>
                        <div><strong class="text-gray-400">Compromissos & Prazos:</strong> ${a.compromissos || '-'}</div>
                        ${a.proxima ? `<div class="text-neon-blue font-semibold"><i class="fa-solid fa-clock"></i> Próxima Reunião: ${a.proxima}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }

        function handleSaveFeedback(e) {
            e.preventDefault();
            const colabSelect = document.getElementById('fbColaborador');
            const colabId = colabSelect.value;
            const colabUser = db.users.find(u => u.id === colabId);

            const newFb = {
                id: 'f' + Date.now(),
                colabId,
                colabNome: colabUser ? colabUser.name : 'Colaborador',
                positivos: document.getElementById('fbPositivos').value,
                melhorias: document.getElementById('fbMelhorias').value,
                competencias: document.getElementById('fbCompetencias').value,
                planoAcao: document.getElementById('fbPlanoAcao').value,
                reconhecimento: document.getElementById('fbReconhecimento').value
            };

            db.feedbacks.unshift(newFb);
            saveDB(db);
            renderFeedbacksGestor();
            e.target.reset();
            showToast('Feedback 360° enviado com sucesso!');
        }

        function renderFeedbacksGestor() {
            // Populate colab select if needed
            const select = document.getElementById('fbColaborador');
            select.innerHTML = db.users.filter(u => u.role === 'colaborador').map(u => `<option value="u.id">{u.name} (${u.cargo})</option>`).join('');

            const container = document.getElementById('feedbacksListContainer');
            container.innerHTML = db.feedbacks.map(f => `
                <div class="glass-panel p-5 rounded-2xl border border-navy-700 space-y-3">
                    <div class="flex justify-between items-center border-b border-navy-700 pb-2">
                        <span class="font-bold text-white text-sm">${f.colabNome}</span>
                        ${f.reconhecimento ? `<span class="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full"><i class="fa-solid fa-award"></i> ${f.reconhecimento}</span>` : ''}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div class="bg-navy-900/60 p-3 rounded-xl">
                            <span class="text-emerald-400 font-bold block mb-1">Pontos Positivos</span>
                            <p class="text-gray-300">${f.positivos}</p>
                        </div>
                        <div class="bg-navy-900/60 p-3 rounded-xl">
                            <span class="text-amber-400 font-bold block mb-1">Pontos de Melhoria</span>
                            <p class="text-gray-300">${f.melhorias}</p>
                        </div>
                    </div>
                    ${f.planoAcao ? `<div class="text-xs text-neon-blue font-medium"><i class="fa-solid fa-bullseye"></i> Plano de Ação: ${f.planoAcao}</div>` : ''}
                </div>
            `).join('');
        }

        function renderSucessao() {
            const container = document.getElementById('sucessaoGrid');
            const colabs = db.users.filter(u => u.role === 'colaborador');

            container.innerHTML = colabs.map(c => `
                <div class="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-white">${c.name}</h3>
                            <div class="text-xs text-neon-blue font-semibold">Cargo Atual: ${c.cargo || 'Analista'}</div>
                        </div>
                        <span class="px-2.5 py-1 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-full text-xs font-bold uppercase">
                            Elegível para Promoção
                        </span>
                    </div>

                    <div class="space-y-2 text-xs">
                        <div>
                            <span class="text-gray-400 uppercase font-semibold">Cargo Alvo Desejado:</span>
                            <div class="text-white font-bold text-sm mt-0.5">${c.cargoAlvo || 'Senior Tech / Lead'}</div>
                        </div>
                        <div>
                            <span class="text-gray-400 uppercase font-semibold">Interesse Mapeado:</span>
                            <p class="text-gray-300 italic mt-0.5">${c.interesse || 'Aguardando preenchimento do colaborador...'}</p>
                        </div>
                        <div>
                            <span class="text-gray-400 uppercase font-semibold">Competências Apresentadas vs Gaps:</span>
                            <div class="flex flex-wrap gap-1 mt-1">
                                <span class="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-2xs">Engenharia de Software (Ok)</span>
                                <span class="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-2xs">Trabalho em Equipe (Ok)</span>
                                <span class="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-2xs">Gestão de Orçamento (Gap)</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        let feedbackChartInstance = null;
        function initFeedbackChart() {
            const ctx = document.getElementById('feedbackChart');
            if (!ctx) return;
            if (feedbackChartInstance) feedbackChartInstance.destroy();

            feedbackChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                        label: 'Evolução Média das Competências (%)',
                        data: [65, 72, 80, 88],
                        borderColor: '#00d2ff',
                        backgroundColor: 'rgba(0, 210, 255, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#00d2ff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#ffffff' } }
                    }
                }
            });
        }

        // ==========================================
        // COLABORADOR FUNCTIONS
        // ==========================================
        function renderColabPerfil() {
            const user = currentUser;
            document.getElementById('colabProfileName').innerText = user.name;
            document.getElementById('colabProfileRole').innerText = `Cargo Atual: ${user.cargo || 'Desenvolvedor'}`;
            document.getElementById('colabAvatarInitials').innerText = user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();

            const profileFields = {
                cpf: user.cpf, email: user.email, phone: user.phone,
                cep: user.cep, city: user.city, state: user.state
            };
            const labels = { cpf: 'profileCpf', email: 'profileEmail', phone: 'profilePhone', cep: 'profileCep', city: 'profileCity', state: 'profileState' };
            Object.entries(labels).forEach(([key, id]) => {
                document.getElementById(id).textContent = profileFields[key] || 'Não informado';
                const edit = document.getElementById({cpf:'editCpf',email:'editEmail',phone:'editPhone',cep:'editCep',city:'editCity',state:'editState'}[key]);
                if (edit) edit.value = profileFields[key] || '';
            });

            document.getElementById('colabCargoAlvoInput').value = user.cargoAlvo || 'Tech Lead Sênior';
            document.getElementById('colabInteresseInput').value = user.interesse || 'Interesse em gestão de projetos e liderança técnica.';

            const badges = ['JavaScript ES6+', 'React.js', 'Node.js', 'Docker', 'Metodologias Ágeis', 'Comunicação Assertiva'];
            document.getElementById('colabCompetenciasBadges').innerHTML = badges.map(b => `
                <span class="px-3 py-1 bg-navy-900 border border-neon-blue/30 text-neon-blue rounded-xl text-xs font-semibold flex items-center gap-1">
                    <i class="fa-solid fa-check text-2xs"></i> ${b}
                </span>
            `).join('');
        }

        function handleSaveObjetivoCarreira(e) {
            e.preventDefault();
            currentUser.cargoAlvo = document.getElementById('colabCargoAlvoInput').value;
            currentUser.interesse = document.getElementById('colabInteresseInput').value;

            // Sync with db
            const idx = db.users.findIndex(u => u.id === currentUser.id);
            if (idx !== -1) {
                db.users[idx] = currentUser;
                saveDB(db);
            }
            showToast('Objetivos de carreira salvos!');
        }

        function handleSaveProfile(e) {
            e.preventDefault();
            currentUser.cpf = document.getElementById('editCpf').value.trim();
            currentUser.email = document.getElementById('editEmail').value.trim();
            currentUser.phone = document.getElementById('editPhone').value.trim();
            currentUser.cep = document.getElementById('editCep').value.trim();
            currentUser.city = document.getElementById('editCity').value.trim();
            currentUser.state = document.getElementById('editState').value.trim().toUpperCase();

            const idx = db.users.findIndex(u => u.id === currentUser.id);
            if (idx !== -1) {
                db.users[idx] = currentUser;
            } else {
                db.users.push(currentUser);
            }
            saveDB(db);
            renderColabPerfil();
            setupDashboardHeader();
            showToast('Dados do perfil atualizados!');
            switchTab('colabTab1', 'colaborador');
        }

        function renderColabTrilhas() {
            const container = document.getElementById('colabTrilhasContainer');
            container.innerHTML = `
                <div class="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-neon-blue/10 text-neon-blue flex items-center justify-center font-bold">1</div>
                        <div>
                            <h3 class="text-base font-bold text-white">Próximo Passo: Sênior / Lead</h3>
                            <p class="text-xs text-gray-400">Requisitos Técnicos e Comportamentais</p>
                        </div>
                    </div>
                    <ul class="space-y-2 text-xs text-gray-300">
                        <li class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-400"></i> Domínio completo em Arquitetura de Software</li>
                        <li class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-400"></i> Capacidade de conduzir Code Reviews criteriosos</li>
                        <li class="flex items-center gap-2 text-amber-300"><i class="fa-solid fa-spinner animate-spin"></i> Liderança direta de pelo menos 2 projetos relevantes</li>
                    </ul>
                </div>

                <div class="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-neon-blue/10 text-neon-blue flex items-center justify-center font-bold">2</div>
                        <div>
                            <h3 class="text-base font-bold text-white">Trilhas Recomendadas</h3>
                            <p class="text-xs text-gray-400">Cursos sugeridos pelo seu gestor</p>
                        </div>
                    </div>
                    <div class="space-y-3 text-xs">
                        <div class="p-3 bg-navy-900 rounded-xl border border-navy-700">
                            <div class="font-bold text-white">Arquitetura de Software Cloud Native</div>
                            <span class="text-neon-blue font-medium">60 horas · Nível Avançado</span>
                        </div>
                        <div class="p-3 bg-navy-900 rounded-xl border border-navy-700">
                            <div class="font-bold text-white">Comunicação e Feedback para Líderes</div>
                            <span class="text-neon-blue font-medium">20 horas · Nível Intermediário</span>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderColabCursos() {
            const grid = document.getElementById('colabCursosGrid');
            const userRel = db.relatorios.filter(r => r.colabId === currentUser.id);

            grid.innerHTML = db.courses.map(c => {
                const rel = userRel.find(r => r.courseId === c.id) || { progress: 0, status: 'Não Iniciado' };
                return `
                    <div class="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-neon-blue font-bold uppercase">${c.level}</span>
                                <span class="text-xs text-gray-400"><i class="fa-solid fa-clock"></i> ${c.duration}</span>
                            </div>
                            <h3 class="text-base font-bold text-white mb-2">${c.title}</h3>
                            <p class="text-xs text-gray-400 mb-4">${c.description}</p>
                            
                            <!-- Progress Bar -->
                            <div class="space-y-1">
                                <div class="flex justify-between text-2xs font-semibold">
                                    <span class="text-gray-400">Progresso</span>
                                    <span class="text-neon-blue">${rel.progress}%</span>
                                </div>
                                <div class="w-full bg-navy-900 rounded-full h-2 overflow-hidden">
                                    <div class="bg-neon-blue h-full" style="width: ${rel.progress}%"></div>
                                </div>
                            </div>
                        </div>

                        ${rel.progress === 100 ? `
                            <button onclick="openCertModal('c.title','{c.duration}')" class="w-full py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-navy-900 transition-colors">
                                <i class="fa-solid fa-certificate"></i> Ver Certificado
                            </button>
                        ` : `
                            <button onclick="showToast('Iniciando módulo de aula...')" class="w-full py-2.5 bg-neon-blue text-navy-900 font-bold rounded-xl hover:bg-neon-cyan transition-colors text-xs uppercase tracking-wider">
                                ${rel.progress > 0 ? 'Continuar Curso' : 'Iniciar Treinamento'}
                            </button>
                        `}
                    </div>
                `;
            }).join('');
        }

        function renderColabProjetos() {
            const grid = document.getElementById('colabProjetosGrid');
            grid.innerHTML = db.projects.map(p => `
                <div class="glass-panel p-6 rounded-2xl border border-navy-700 space-y-3">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-bold text-white">${p.name}</h3>
                        <span class="text-2xs bg-neon-blue/20 text-neon-blue px-2.5 py-1 rounded-full font-bold uppercase">${p.duration}</span>
                    </div>
                    <p class="text-xs text-gray-400">${p.desc}</p>
                    <div class="text-xs text-neon-blue font-semibold"><i class="fa-solid fa-code"></i> Perfil Procurado: ${p.roleNeeded}</div>
                    <button onclick="showToast('Candidatura enviada para o lider do projeto!')" class="w-full mt-2 py-2 bg-navy-700 hover:bg-neon-blue hover:text-navy-900 text-neon-blue font-bold rounded-xl transition-colors text-xs uppercase">
                        Candidatar-se ao Projetos
                    </button>
                </div>
            `).join('');
        }

        function renderColabFeedbacks() {
            const container = document.getElementById('colabFeedbacksHistory');
            const myFbs = db.feedbacks.filter(f => f.colabId === currentUser.id);

            if (myFbs.length === 0) {
                container.innerHTML = `<div class="glass-panel p-8 text-center text-gray-400 text-sm">Nenhum feedback registrado no seu histórico até o momento.</div>`;
                return;
            }

            container.innerHTML = myFbs.map(f => `
                <div class="glass-panel p-6 rounded-2xl border border-navy-700 space-y-4">
                    <div class="flex justify-between items-center border-b border-navy-700 pb-3">
                        <div class="font-bold text-white">Feedback do Gestor</div>
                        ${f.reconhecimento ? `<span class="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full"><i class="fa-solid fa-medal"></i> ${f.reconhecimento}</span>` : ''}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div class="bg-navy-900/80 p-4 rounded-xl border border-navy-700">
                            <span class="text-emerald-400 font-bold block mb-1">Pontos Fortes</span>
                            <p class="text-gray-300 leading-relaxed">${f.positivos}</p>
                        </div>
                        <div class="bg-navy-900/80 p-4 rounded-xl border border-navy-700">
                            <span class="text-amber-400 font-bold block mb-1">Oportunidades de Desenvolvimento</span>
                            <p class="text-gray-300 leading-relaxed">${f.melhorias}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function renderColabPDI() {
            const pdi = db.pdi;
            const doneList = document.getElementById('pdiDoneList');
            const pendingList = document.getElementById('pdiPendingList');

            doneList.innerHTML = pdi.done.map(item => `
                <li class="flex items-center gap-3 bg-navy-900/60 p-3 rounded-xl border border-emerald-500/20">
                    <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
                    <span>${item}</span>
                </li>
            `).join('');

            pendingList.innerHTML = pdi.pending.map((item, idx) => `
                <li class="flex items-center justify-between bg-navy-900/60 p-3 rounded-xl border border-amber-500/20">
                    <div class="flex items-center gap-3">
                        <i class="fa-regular fa-circle text-amber-400 text-lg"></i>
                        <span>${item}</span>
                    </div>
                    <button onclick="markPdiDone(${idx})" title="Marcar como concluído" class="text-xs text-neon-blue hover:underline">
                        Concluir
                    </button>
                </li>
            `).join('');
        }

        function markPdiDone(index) {
            const item = db.pdi.pending.splice(index, 1)[0];
            if (item) {
                db.pdi.done.push(item);
                saveDB(db);
                renderColabPDI();
                showToast('Item do PDI concluído!');
            }
        }

        function openCertModal(courseTitle, hours) {
            document.getElementById('certCourseTitle').innerText = courseTitle;
            document.getElementById('certHours').innerText = hours;
            document.getElementById('certUserName').innerText = currentUser ? currentUser.name : 'Ana Silva';
            document.getElementById('certDate').innerText = new Date().toLocaleDateString('pt-BR');
            document.getElementById('certificateModal').classList.remove('hidden');
        }

        function closeCertModal() {
            document.getElementById('certificateModal').classList.add('hidden');
        }
