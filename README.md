# MediGest

**MediGest** é uma WebApp progressiva (PWA) para a gestão de medicamentos entre cuidadores (admins) e pacientes, com autenticação via Supabase e interface responsiva.

---

## 🔧 Tecnologias Usadas

* HTML, CSS, JavaScript (sem frameworks pesados)
* [Bootstrap 5](https://getbootstrap.com/) para o layout responsivo
* [Supabase](https://supabase.com/) para:

  * Autenticação (Supabase Auth)
  * Base de dados (PostgreSQL)
  * Armazenamento de imagens (Storage)
* PWA: `manifest.json`, Service Worker, notificacões nativas

---

## 🔑 Funcionalidades

### Paciente:

* Regista-se e liga-se a um cuidador via código
* Vê os medicamentos prescritos
* Confirma diariamente a toma (com histórico)
* Gera código de partilha para o cuidador
* Atualiza o perfil com nome, avatar e logout

### Cuidador (Admin):

* Cria medicamentos e pode editá-los/removê-los
* Liga-se a pacientes através de código
* Vê pacientes associados com notas personalizadas
* Prescreve medicamentos individualmente a cada paciente
* Vê confirmações dos pacientes

### Extra:

* Upload de imagem de perfil localmente (sem bucket)
* Notificações locais no login
* Design temático (verde)
* Todos os ecrãs estilizados com Bootstrap

---

## 🚀 Como correr localmente

1. Clonar o projeto:

```bash
git clone https://github.com/DiogoMedeiros04/medigest.git
```

2. Abrir no VS Code ou outro editor

3. Servir com uma live server ou abrir `index.html`

4. Configurar Supabase:

   * Adicionar as variáveis no `supabaseClient.js`
   * Garantir que as tabelas estão criadas:

     * `profiles`, `medications`, `prescriptions`, `confirmations`

---

## 🛠️ A melhorar futuramente

* Agenda de lembretes com `setInterval` ou notificacões push reais
* Suporte offline completo (service worker com cache dinâmico)
* Stock e inventário de medicamentos
* Modo escuro
* Estatísticas para admins (confirmados, atrasos, etc)

---

## 👤 Autor

**Diogo Medeiros** – projeto educativo e de aprendizagem com base em necessidades reais de gestão de medicação.

[Ver Repositório](https://github.com/DiogoMedeiros04/medigest)
