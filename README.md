# AWS_NODE_AGO24_DESAFIO_03_CORINGA

**Desenvolvido por Wagner Suzano Urivi**

Um guia passo a passo para criar uma instância EC2 na AWS, configurar o ambiente do servidor, implantar sua API Node.js com TypeScript, configurar o banco de dados MariaDB, e gerenciar o processo com PM2. Ao final, você terá uma API funcionando em produção, acessível publicamente.

## **1. Pré-requisitos**

Antes de iniciar, certifique-se de ter os seguintes componentes:

- **Conta na AWS**: Com permissões para criar instâncias EC2.
- **Par de Chaves SSH**: Para acessar a instância EC2.
- **Git**: Instalado localmente para clonar o repositório.
- **Código da API**: Repositório Git contendo sua API Node.js com TypeScript.
- **Conhecimento Básico de Linux e SSH**.

---

## **2. Passo 1: Criar uma Instância EC2 na AWS**

### **2.1. Acessar o Console da AWS**

1. Acesse o [Console de Gerenciamento da AWS](https://aws.amazon.com/pt/console/).
2. Faça login com suas credenciais.

### **2.2. Lançar uma Nova Instância EC2**

1. No Console da AWS, navegue até **EC2**:

   - **Serviços** > **EC2**.

2. Clique em **"Launch Instance"**.

3. **Configurar a Instância:**
   - **Nome e Tags**: Opcionalmente, dê um nome à sua instância.
   - **AMI (Amazon Machine Image)**:
     - Selecione **Ubuntu Server 22.04 LTS** (ami-00eb69d236edcfaf8) ou outra versão de sua preferência.
   - **Tipo de Instância**:
     - **t2.micro** (gratuito) ou outro conforme suas necessidades.
   - **Configurações de Instância**:
     - Mantenha as configurações padrão ou ajuste conforme necessário.
   - **Armazenamento**:
     - Mantenha o armazenamento padrão ou ajuste conforme necessário.
   - **Grupo de Segurança**:
     - Configure as regras de firewall para permitir o tráfego necessário.

### **2.3. Configurar o Grupo de Segurança**

1. **Criar um Novo Grupo de Segurança**:

   - **Tipo de Instância**: Escolha **Público**.
   - **Regra de Entrada (Inbound Rules)**:
     - **SSH**:
       - **Tipo**: SSH
       - **Porta**: 22
       - **Origem**: Seu IP ou `0.0.0.0/0` (menos seguro).
     - **HTTP**:
       - **Tipo**: HTTP
       - **Porta**: 80
       - **Origem**: `0.0.0.0/0`
     - **Porta da API**:
       - **Tipo**: Custom TCP
       - **Porta**: 3000 (ou a porta usada pela sua API)
       - **Origem**: `0.0.0.0/0`

   > **Nota:** Configurar a origem como `0.0.0.0/0` permite acesso de qualquer lugar, o que pode não ser seguro. Considere restringir o acesso conforme necessário.

2. **Salvar as Configurações**.

### **2.4. Selecionar e Criar um Par de Chaves SSH**

1. **Selecione um Par de Chaves**:

   - Selecione um par existente ou crie um novo.
   - **Novo Par de Chaves**:
     - **Nome**: `my-ssh-key` (ou outro de sua preferência).
     - **Download**: Baixe o arquivo `.pem` e mantenha-o seguro.

   > **Importante:** Este arquivo `.pem` será usado para acessar sua instância via SSH. Guarde-o em um local seguro.

2. **Lançar a Instância**:
   - Clique em **"Launch Instance"** após configurar todas as opções.

---

## **3. Passo 2: Conectar-se à Instância EC2 via SSH**

### **3.1. Obter o Endereço IP Público da Instância**

1. No Console da AWS, navegue até **EC2** > **Instâncias**.
2. Selecione sua instância recém-criada.
3. Clique em conectar **È selecione a opção de Cliente SSh**
4. Abra o PowerShell como admin
5. Localize o arquivo de chave privada. A chave usada para executar esta instância é my-ssh-key.pem

### **3.2. Conceder Permissões ao Arquivo `.pem`**

No seu computador local, ajuste as permissões do arquivo `.pem` para garantir a segurança.

```bash
chmod 400 path/to/my-ssh-key.pem
```

Exemplo do comando SSH:

```powershell
ssh -i "path/to/my-ssh-key.pem" ubuntu@ec2-3-145-109-135.us-east-2.compute.amazonaws.com
```

Nota: Substitua path/to/my-ssh-key.pem pelo caminho real do seu arquivo .pem e <ENDEREÇO_IP_PÚBLICO> pelo endereço IP ou DNS da sua instância.

## **4. Passo 3: Configurar o Servidor**

### **4.1. Atualizar Pacotes do Sistema**

Atualize os pacotes existentes para garantir que você tenha as últimas versões e correções de segurança.

```bash
sudo apt update && sudo apt upgrade -y
```

### **4.2. Instalar Node.js e npm**

Instale o Node.js (versão 16 ou superior) e o npm.

**1. Adicionar o Repositório NodeSource:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

**2. Instalar Node.js:**

```bash
sudo apt-get install -y nodejs
```

**3. Verificar a Instalação:**

```bash
node -v
npm -v
```

### **4.3. Instalar Git**

Instale o Git para clonar o repositório da sua API.

```bash
sudo apt install git -y
```

### **4.4. Instalar PM2**

PM2 é um gerenciador de processos para aplicações Node.js que facilita a manutenção e o monitoramento da aplicação em produção.

```bash
sudo npm install -g pm2
```

### **4.5. Instalar MariaDB**

Instale o MariaDB, um sistema de gerenciamento de banco de dados relacional.

```bash
sudo apt install mariadb-server -y
```

## **5. Passo 4: Configurar o Banco de Dados MariaDB**

### **5.1. Inicializar e Segurar o MariaDB**

**1. Iniciar o Serviço MariaDB:**

```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

**2. Executar o Assistente de Segurança:**

```bash
sudo mysql_secure_installation
```

Siga as instruções para:

Definir uma senha para o usuário root (se ainda não estiver definida).

Remover usuários anônimos.

Desabilitar login remoto do root.

Remover o banco de dados de teste.

Recarregar as tabelas de privilégios.

### **5.2. Criar Banco de Dados**

**1. Acessar o MariaDB como root:**

```bash
sudo mysql -u root -p
```

Insira a senha definida durante o mysql_secure_installation.

**2. Criar um Novo Usuário:**
Substitua novo_usuario e senha_segura pelos valores desejados.

```bash
CREATE USER 'novo_usuario'@'localhost' IDENTIFIED BY 'senha_segura';
```

**3. Criar o Banco de Dados**

```bash
CREATE DATABASE name_database;
```

**4. Conceder Todas as Permissões ao Novo Usuário no Banco de Dados**

```bash
GRANT ALL PRIVILEGES ON name_database.* TO 'novo_usuario'@'localhost';
```

**5. Aplicar as Alterações de Privilégios:**

```bash
FLUSH PRIVILEGES;
```

**6. Sair do MariaDB:**

```bash
EXIT;
```

## **6. Passo 5: Clonar o Repositório da API**

**1. Navegue até o Diretório Desejado:**

```bash
cd ~
```

**2. Clonar o Repositório:**
Substitua a URL pelo URL do seu repositório.

```bash
git clone git@github.com:WagnerSuzano2/AWS_NODE_AGO24_DESAFIO_02_CORINGA.git
```

**3. Entrar no Diretório do Projeto:**

```bash
cd AWS_NODE_AGO24_DESAFIO_02_CORINGA
```

## **7. Passo 6: Instalar Dependências**

Instale todas as dependências necessárias para o projeto.

```bash
npm install
```

## **8. Passo 7: Configurar Variáveis de Ambiente**

**1. Criar o Arquivo .env:**

```bash
nano .env
```

**2. Adicionar as Variáveis de Ambiente Necessárias:**
Substitua os valores conforme necessário.

```bash
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=name_database
DB_PASS=password_user
DB_NAME=name_database
```

**3. Salvar e Fechar o Arquivo:**

- No **nano**, pressione `CTRL + O` para salvar e `CTRL + X` para sair.

## **9. Passo 8: Compilar o Projeto**

Compile os arquivos TypeScript para JavaScript, gerando a pasta dist/.

```bash
npm run build
```

## **10. Passo 9: Executar Migrações**

**1. Executar as Migrações Compiladas:**

```bash
npm run migration:generate:prod
npm run migration:run:prod
```

Nota: Certifique-se de que o data-source.js está configurado para apontar para as migrações compiladas (.js).

**2. Verificar as Tabelas no Banco de Dados:**
Conecte-se ao MariaDB e verifique se as tabelas foram criadas.

```bash
mysql -u novo_usuario -p
```

**Dentro do MariaDB:**

```bash
USE name_database;
SHOW TABLES;
```

**Saída Esperada:**

```sql
+-------------------+
| Tables_in_database|
+-------------------+
| Order             |
| cars              |
| customers         |
| migrations        |
| users             |
+-------------------+
```

**para sair do MariaDB**

```sql
EXIT;
```

## **11. Passo 10: Iniciar a Aplicação com PM2**

**1. Iniciar a Aplicação Utilizando PM2:**

```bash
pm2 start dist/server.js --name minha-api
```

**2. Verificar o Status da Aplicação:**

```bash
pm2 status
```

**Exemplo de Saída:**

```arduino
┌────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name         │ namespace   │ version │ mode    │ pid      │ uptime │  ↺   │ status    │ cpu      │ mem      │ user     │ watching │
├────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ minha-api    │ default     │ 1.0.0   │ fork    │ 9107     │ 24s    │ 0    │ online    │ 0%       │ 82.6mb   │ ubuntu   │ disabled │
└────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

## **12. Passo 11: Configurar PM2 para Reiniciar na Inicialização do Sistema**

Isso garante que sua aplicação será reiniciada automaticamente após reiniciar o servidor.

**1. Configurar o PM2 para Iniciar com o Sistema:**

```bash
pm2 startup systemd
```

**Saída Esperada:**

```bash
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**2. Copiar e Executar o Comando Sugerido:**

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Nota: Substitua ubuntu pelo nome do usuário do servidor, se for diferente.

**3. Salvar a Configuração Atual do PM2:**

```bash
pm2 save
```

**Saída Esperada:**

```bash
[PM2] Saving current process list...
[PM2] Successfully saved in /home/ubuntu/.pm2/dump.pm2
```

## **13. Passo 12: Testar a API**

**1. Testes Manuais com Postman**
Postman é uma ferramenta poderosa para testar APIs manualmente.

**Instalar o Postman:**

Acesse https://www.postman.com/downloads/ e baixe a versão adequada para seu sistema operacional.
Siga as instruções de instalação.

**2. Criar e Configurar Requisições:**

- Abra o Postman.
- Clique em "New" > "Request".
- Nomeie sua requisição e salve-a em uma Coleção (por exemplo, "API Car Rental").

- Configure o método HTTP (GET, POST, PUT, DELETE) e a URL do endpoint, por exemplo vamos usar o metodo POST nesta rota de login:

```url
http://seu-endereço-ip-ou-dns-publico:porta-da-aplicação/login
```

**Para métodos como POST ou PUT, adicione o corpo da requisição em formato JSON.
Para essa requisição vamos usa uma seed para gerar o token:**

```JSON
{
    "email": "admin@example.com",
    "password": "adminpassword"
}
```

**Para essa requisição a saida esperada e esta:**

```JSON
{
    "token": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzMxMzU4NzY5LCJleHAiOjE3MzEzNTkzNjl9.dKLOtoeab3q1-TdfcDdJSwtuQckW00hNSClTtUkcDMI"
    }
}
```

**com este token podemos fazer a requisição em qualquer metodo e entidade da api, no campo Auth selecione o tipo
Beare token e assim será possivel fazer a requisição em todas as rotas da api**

## **14. Criar e Configurar um Bucket S3 Público**

**1. Criar um Bucket S3**

1.Acessar o Console AWS S3:

- Navegue até o Console AWS S3.

  2.Criar um Novo Bucket:

- Clique em "Create bucket".

- Nome do Bucket: Escolha um nome único globalmente, por exemplo, compass-car-api-docs.

- Região: Selecione a região mais próxima de seus usuários ou conforme sua preferência.

- Configurações de Privacidade:

- Desmarque a opção "Block all public access" para permitir acesso público.

- Aviso de Segurança: Você será solicitado a confirmar a ação. Certifique-se de que entende as implicações de tornar o bucket público.

  3.Finalizar a Criação do Bucket:

- Clique em "Create bucket".

## **Estrutura da Documentação para cada Endpoint**

## Endpoint de Users

### POST users

**Descrição**: Criação de um novo usuário.

**Corpo da Requisição** (Campos obrigatórios):

```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string (email)",
  "password": "string (senha criptografada)"
}
```

### GET users

**Descrição**: Listagem de usuários com filtros e paginação.

**Parâmetros de Consulta**:

`name` (string, opcional): Filtrar por parte do nome do usuário.
`email` (string, opcional): Filtrar por parte do e-mail.
`excluded` (boolean, opcional): Filtrar por status de exclusão (sim/não).
`sort` (string, opcional): Campo de ordenação (nome, data de cadastro, data de exclusão).
`page` (integer, opcional): Página atual da lista.
`pageSize` (integer, opcional): Tamanho da pági

**Exemplo de requisição**: <br>
GET users?name=John&email=john.doe@example.com&excluded=false&sort=name&page=1&pageSize=10

**200:** Lista de usuários retornada com sucesso:

```json
{
  "total": "integer",
  "totalPages": "integer",
  "currentPage": "integer",
  "users": ["/lista de usuários/"]
}
```

### GET users/:{id}

**Descrição**: Busca um usuário por ID.

**Parâmetro de Caminho**:

`id` (string, obrigatório): ID do usuário.

### PATCH users/:{id}

**Descrição**: Atualizar informações de um usuário.

**Parâmetro de Caminho**:

`id` (string, obrigatório): ID do usuário.
**Corpo da Requisição** (Campos opcionais):

```json
{
  "name": "string",
  "email": "string (email)",
  "password": "string (senha criptografada)"
}
```

### DELETE users/:{id}

**Descrição**: Soft delete de um usuário (marcar como excluído).

**Parâmetro de Caminho**:

`id` (string, obrigatório): ID do usuário.

### POST login

**Descrição**: Autenticação de usuário (login).

**Corpo da Requisição** (Campos obrigatórios):

```json
{
  "email": "string (email)",
  "password": "string (senha)"
}
```

## Endpoint de Carros

### POST /cars/create

**Descrição**: Cria um novo carro.

**Corpo da requisição** (Campos obrigatórios):

```json
{
  "plate": "string",
  "brand": "string",
  "model": "string",
  "mileage": "integer",
  "year": "integer",
  "items": ["string"],
  "daily_price": "number (float)",
  "status": "string (active ou inactive)"
}
```

### GET cars/

**Descrição**: Lista todos os carros com opções de filtragem.

**Parâmetros de Consulta** (opcionais):
`status` (string): Filtra pelo status do carro. Valores possíveis: `active`, `inactive`, `deleted`.
`plateEnd` (string): Filtra pelos últimos caracteres da placa.
`brand` (string): Filtra pela marca do carro.
`model` (string): Filtra pelo modelo do carro.
`mileage` (integer): Filtra pela quilometragem do carro.
`yearFrom` (integer): Filtra pelo ano mínimo.
`yearTo` (integer): Filtra pelo ano máximo.
`dailyPriceMin` (number): Filtra pelo preço diário mínimo.
`dailyPriceMax` (number): Filtra pelo preço diário máximo.
`items` (string): Filtra por itens (valores separados por vírgula).

**Resposta**:

```json
{
  "totalCount": "integer",
  "totalPages": "integer",
  "currentPage": "integer",
  "cars": [
    {
      "id": "string",
      "plate": "string",
      "brand": "string",
      "model": "string",
      "mileage": "integer",
      "year": "integer",
      "items": ["string"],
      "daily_price": "number (float)",
      "status": "string",
      "registration_date": "string (date-time)",
      "updated_time": "string (date-time)"
    }
  ]
}
```

### GET cars/:{id}

**Descrição**: Busca um carro por ID.

**Parâmetro de Caminho**:
`id` (string, obrigatório): ID do carro.

### PATCH cars/update/:{id}

**Descrição**: Atualiza informações de um carro.

**Parâmetro de Caminho**:

- `id` (string, obrigatório): ID do carro.

**Corpo da Requisição** (Campos opcionais):

```json
{
  "plate": "string",
  "brand": "string",
  "model": "string",
  "mileage": "integer",
  "year": "integer",
  "items": ["string"],
  "daily_price": "number (float)"
}
```

### DELETE cars/delete/:{id}

**Descrição**: Soft delete de um carro (marcar como excluído).

Parâmetro de Caminho:

`id` (string, obrigatório): ID do carro.

## Endpoint de Clientes

### POST /customers/create

**Descrição**: Cria um novo cliente.

**Corpo da Requisição** (Campos obrigatórios):

```json
{
  "fullName": "string",
  "email": "string (email)",
  "birthDate": "string (date)",
  "cpf": "string",
  "phone": "string"
}
```

### GET /customers/

**Descrição**: Listagem de clientes com filtros e paginação.

**Parâmetros de Consulta** (opcionais):

`fullName` (string): Filtrar por parte do nome do cliente.
`email` (string): Filtrar por parte do e-mail.
`cpf` (string): Filtrar por parte do CPF do cliente.
`exclude` (boolean): Filtrar por status de exclusão (sim/não).
`order` (string): Campo de ordenação (nome, data de cadastro, data de exclusão).
`page` (integer): Página atual da lista.
`pageSize` (integer): Tamanho da página.

**Resposta**:

```json
{
  "totalCount": "integer",
  "totalPages": "integer",
  "currentPage": "integer",
  "customers": [
    {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "birthDate": "string",
      "cpf": "string",
      "phone": "string",
      "registrationDate": "string (date-time)",
      "status": "string"
    }
  ]
}
```

### GET customers/:{id}

**Descrição**: Busca um cliente por ID.

**Parâmetro de Caminho**:

`id` (string, obrigatório): ID do cliente.

**Resposta**:

```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "birthDate": "string",
  "cpf": "string",
  "phone": "string",
  "registrationDate": "string (date-time)",
  "status": "string"
}
```

### PATCH customers/{id}

**Descrição**: Atualizar informações de um cliente.

**Parâmetro de Caminho**:

`id` (string, obrigatório): ID do cliente.
**Corpo da Requisição** (Campos opcionais):

```json
{
  "fullName": "string",
  "email": "string (email)",
  "birthDate": "string",
  "cpf": "string",
  "phone": "string"
}
```

### DELETE customers/{id}

**Descrição**: Soft delete de um cliente (marcar como excluído).

**Parâmetro de Caminho**:

`id` (string, obrigatório): ID do cliente.

## Endpoint de Pedidos

### POST /orders/create

**Descrição**: Criação de um novo pedido de locação.

**Corpo da Requisição** (Campos obrigatórios):

```json
{
  "cpf_cliente": "string (CPF do cliente)",
  "plate": "string (Placa do carro)"
}
```

### GET /orders

**Descrição**: Lista todos os pedidos de locação.

Resposta:

```json
[
  {
    "id": "string (UUID)",
    "cpf_cliente": "string (CPF do cliente)",
    "plate": "string (Placa do carro)",
    "statusRequest": "string (Status do pedido)",
    "dateRequest": "string (data-hora da solicitação)",
    "startDate": "string (data de início do aluguel)",
    "endDate": "string (data de término do aluguel)"
  }
]
```

### GET /orders/{id}

**Descrição**: Busca um pedido de locação por ID.

**Parâmetro de Caminho**:

`id` (string, obrigatório): ID do pedido de locação.

Resposta:

```json
{
  "id": "string (UUID)",
  "cpf_cliente": "string (CPF do cliente)",
  "plate": "string (Placa do carro)",
  "statusRequest": "string (Status do pedido)",
  "dateRequest": "string (data-hora da solicitação)",
  "startDate": "string (data de início do aluguel)",
  "endDate": "string (data de término do aluguel)"
}
```

### PATCH /orders/update/{id}

**Descrição**: Atualização de um pedido de locação.

**Parâmetro de Caminho**:

´id´ (string, obrigatório): ID do pedido de locação.

**Corpo da Requisição** (Campos obrigatórios):

```json
{
  "statusRequest": "string (Novo status do pedido)"
}
```

### DELETE /orders/delete/{id}

**Descrição**: Cancela um pedido de locação.

**Parâmetro de Caminho**:
`id` (string, obrigatório): ID do pedido de locação.

# LINKS

Link Swagger: [documento Swagger API](https://compass-car-api-docs.s3.us-east-2.amazonaws.com/swagger.html)

Link da api desenvolvida neste projeto:

http://ec2-3-145-109-135.us-east-2.compute.amazonaws.com:3000
