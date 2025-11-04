Crie um front-end moderno para um sistema de geração de criativos de marketing digital, seguindo as diretrizes abaixo:

Requisitos principais
Tela de login obrigatória (autenticação de usuário via Supabase: e-mail/senha, OAuth ou magic link).

Após login, usuário acessa a tela principal do editor.

Tela principal dividida em três áreas:

Chat lateral à esquerda: interface tipo ChatGPT, onde o usuário pode conversar com a IA para pedir sugestões ou gerar uma arte.
Preview da arte ao centro/direita: componente React/HTML que exibe em tempo real a arte personalizada (post/story/banner).
Menus flutuantes de personalização: botões ou painéis flutuantes (estilo Canva) para editar tema, cor, gradiente, padrão, fonte, imagem de fundo, etc.
O usuário pode:

Pedir para a IA criar uma arte (ex: “quero um post para Black Friday com fundo roxo e fonte moderna”).
Ou personalizar manualmente usando os menus flutuantes.
Visualizar o resultado em tempo real.
Exportar a arte como imagem (PNG/JPEG).
Layout clean, responsivo, com foco na experiência visual e facilidade de uso.

Tecnologias sugeridas
React + Vite (ou Next.js, se preferir SSR)
Tailwind CSS para estilização
Supabase como backend (auth, storage, banco)
Integração com API de IA (OpenAI, Replicate, etc) para sugestões automáticas
html2canvas ou dom-to-image para exportação do preview
Tipos de personalização
Tema (cores, gradientes, padrões)
Cor principal/secundária/texto/fundo
Gradiente (linear, radial, cônico)
Padrão gráfico
Fonte/tipografia (tipo, tamanho, peso, espaçamento)
Imagem de fundo (upload ou IA)
Paleta de cores customizada
Estrutura sugerida de componentes
<MainLayout>
<Login /> (antes do acesso ao editor)
<ChatSidebar />
<ArtPreview />
<FloatingMenus /> (menus de personalização)
Wireframe (Markdown)
-------------------------------------------------------------
| Chat (esquerda) |   Preview da Arte   | Menus Flutuantes   |
|-----------------|--------------------|--------------------|
|                 |  [ Arte gerada ]   | [Botões flutuantes |
| [ChatBox]       |                    |  de tema, cor,     |
|                 |                    |  fonte, etc. ]     |
-------------------------------------------------------------
Critérios de aceitação
Usuário só acessa o editor após login.
Usuário consegue customizar tema, cor, gradiente, padrão, fonte e texto.
Preview reflete as customizações em tempo real.
Exportação gera imagem fiel ao preview.
IA sugere pelo menos cor, fonte, texto ou padrão automaticamente.
QUEO O DESIGN INCRIVEL SEM EXAGERAR EM ANIMAÇOES