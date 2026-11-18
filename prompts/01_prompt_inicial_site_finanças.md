2# Prompt inicial — site Petcare
 
Crie neste repositório um site funcional de gestão de gestão de alimentação de animais , usando como fontes de verdade:
 
- `docs/design_system.md` — identidade visual, tipografia, espaçamento, componentes e temas.
- `supabase/schema.sql` — tabelas, colunas, regras de acesso e políticas RLS.
 
## 1. Objetivo do banco de dados
 
O banco de dados deverá armazenar e organizar as informações dos animais atendidos pela ONG, seus alimentos, planos alimentares e histórico de peso.
 
O banco deverá permitir que os usuários autenticados cadastrem, consultem, editem e excluam seus próprios registros.
 
## 2. Tabelas que deverão ser criadas
 
Criar quatro tabelas principais:
 
**Tabela 1 — animals**
 
Responsável pelo cadastro dos animais.
 
Campos:
- id: UUID, chave primária.
- user_id: UUID, referência ao usuário autenticado.
- name: nome do animal.
- species: espécie.
- breed: raça.
- sex: sexo.
- birth_date: data de nascimento.
- current_weight: peso atual.
- status: situação do animal.
- observations: observações.
- created_at: data de cadastro.
 
**Tabela 2 — foods**
 
Responsável pelo cadastro dos alimentos.
 
Campos:
- id: UUID, chave primária.
- user_id: UUID, referência ao usuário autenticado.
- name: nome do alimento.
- brand: marca.
- food_type: tipo de alimento.
- ingredients: ingredientes.
- restrictions: restrições alimentares.
- observations: observações.
- created_at: data de cadastro.
 
**Tabela 3 — feeding_plans**
 
Responsável pelos planos alimentares.
 
Campos:
- id: UUID, chave primária.
- user_id: UUID, referência ao usuário autenticado.
- animal_id: referência à tabela animals.
- food_id: referência à tabela foods.
- daily_quantity: quantidade diária em gramas.
- meals_per_day: refeições por dia.
- feeding_times: horários das refeições.
- observations: observações.
- active: situação do plano.
- created_at: data de cadastro.
 
**Tabela 4 — weight_records**
 
Responsável pelo histórico de peso dos animais.
 
Campos:
- id: UUID, chave primária.
- user_id: UUID, referência ao usuário autenticado.
- animal_id: referência à tabela animals.
- weight: peso registrado.
- record_date: data da pesagem.
- observations: observações.
- created_at: data de cadastro.
 
## 3. Regras de criação
 
Utilizar:
- PostgreSQL.
- UUID como identificador.
- `gen_random_uuid()` como valor padrão das chaves primárias.
- `auth.users` para relacionar os registros aos usuários.
- `TIMESTAMPTZ` para datas de criação.
- `NUMERIC` para pesos e quantidades.
- Chaves estrangeiras para os relacionamentos.
- Restrições CHECK para validar os dados.
 
## 4. Índices
 
Criar índices para melhorar as consultas por usuário, nome do animal, nome do alimento, planos por animal e histórico de pesagem por data.
 
## 5. Segurança — RLS
 
Habilitar Row Level Security em todas as tabelas.
 
Criar políticas individuais para:
 
- SELECT: consultar os próprios registros.
- INSERT: inserir registros vinculados ao usuário autenticado.
- UPDATE: atualizar somente os próprios registros.
- DELETE: excluir somente os próprios registros.
 
As tabelas relacionadas também deverão validar se o animal e o alimento pertencem ao mesmo usuário.
 
## 6. Permissões
 
Revogar o acesso de `anon` às tabelas e conceder permissões de SELECT, INSERT, UPDATE e DELETE ao papel `authenticated`.
 
Nunca utilizar a chave `service_role` no código do navegador.
 
## 7. Organização do arquivo SQL
 
Criar o arquivo:
 
`supabase/schema.sql`
 
Organizar o script nesta sequência:
 
1. Criação das tabelas.
2. Definição das chaves primárias.
3. Definição das chaves estrangeiras.
4. Restrições e validações.
5. Criação dos índices.
6. Habilitação do RLS.
7. Criação das políticas de segurança.
8. Definição das permissões.
 
Utilizar `IF NOT EXISTS` na criação de tabelas e índices e `DROP POLICY IF EXISTS` antes de recriar políticas, para facilitar a execução novamente do script.
 
Não inserir animais ou alimentos fictícios como dados iniciais.
 
## 8. Resultado esperado
 
Entregar um arquivo SQL completo, organizado, comentado e pronto para ser executado no SQL Editor do Supabase.
 
O código deverá estar compatível com as funcionalidades previstas no primeiro prompt do PetCare ONG.
 
Não criar tabelas desnecessárias e não alterar os nomes dos campos definidos neste documento.
 
Antes de finalizar, verificar os relacionamentos, as políticas RLS e as permissões para evitar inconsistências no banco de dados.   