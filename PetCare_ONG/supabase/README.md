# PetCare ONG – Gestão Nutricional Animal

Aplicação web para apoiar ONGs no cadastro de cães acolhidos, organização de rações e controle de planos alimentares.

## Problema identificado
ONGs cuidam de animais com diferentes pesos, idades e necessidades. Manter essas informações em anotações separadas pode dificultar o acompanhamento e aumentar o risco de oferecer um alimento incompatível com uma restrição registrada.

## Objetivo
Centralizar informações dos cães, alimentos e planos alimentares, permitindo consulta, edição, exclusão e identificação de possíveis incompatibilidades entre restrições do animal e ingredientes cadastrados.

## Integrantes
- Daniel Neto Florêncio;
- Janiele Carvalho de Souza;
- Talyta da Silva Nascimento.

## Tecnologias
HTML5, CSS3, JavaScript Vanilla, Tailwind CSS, Supabase Authentication, Supabase Database, SweetAlert2, Lucide Icons, GitHub e GitHub Pages.

## Funcionalidades
- Cadastro, login e logout.
- Cadastro de animais (CRUD).
- Cadastro de rações e alimentos (CRUD).
- Cadastro de planos alimentares (CRUD).
- Painel com indicadores e alertas de possíveis incompatibilidades.
- Interface responsiva.

## Configuração
1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute todo o conteúdo de `supabase.sql`.
3. Em Project Settings > API, copie a Project URL e a chave `anon`/publishable.
4. Cole os valores no arquivo `config.js`, nos campos `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
5. Não utilize a chave `service_role` no navegador.
6. Para testar localmente, utilize um servidor estático (por exemplo, a extensão Live Server do VS Code).
7. Cadastre uma conta pela tela inicial.

## Publicação no GitHub Pages
1. Envie todos os arquivos para um repositório GitHub.
2. Acesse Settings > Pages.
3. Em Build and deployment, selecione Deploy from a branch.
4. Selecione a branch `main` e a pasta `/ (root)`.
5. Salve e aguarde a publicação.
6. Em Supabase Authentication > URL Configuration, adicione o endereço publicado do GitHub Pages às URLs permitidas (Site URL e Redirect URLs, conforme a configuração do projeto).

## Segurança e limitações
As tabelas utilizam Row Level Security (RLS) e cada registro pertence ao usuário autenticado que o criou. Para uma ONG com vários voluntários compartilhando os mesmos dados, será necessário evoluir o modelo para organizações e membros, com autorização por ONG, em vez de propriedade individual.

O alerta de ingredientes é uma conferência textual simples entre as restrições digitadas e os ingredientes cadastrados. Não reconhece sinônimos, derivados ou contaminação cruzada e não substitui avaliação veterinária. A quantidade diária inserida no plano deve ser definida ou validada por médico-veterinário; o sistema apenas divide o total informado pelo número de refeições.

## Link publicado
[Adicionar aqui o endereço do GitHub Pages]
