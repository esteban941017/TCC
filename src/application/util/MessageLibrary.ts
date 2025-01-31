export const MessageLibrary = {
  name: 'Qual o seu nome?',
  home: `Oi {{name}}, como posso ajudar?
  
  1. Registrar uma despesa pessoal
  2. Consultar as minhas despesas
  3. Registrar uma categoria
  4. Consultar as minhas categorias
  5. Registrar uma despesa grupal
  6. Registrar ou entrar em um grupo
  7. Consultar os meus grupos
  8. Sair`,
  registerPersonalExpenseDate:
    'Por favor, insira a data da despesa em formato DD/MM/AAAA',
  registerPersonalExpenseDescription:
    'Por favor, insira a descrição da despesa',
  registerPersonalExpenseAmount:
    'Por favor, insira o valor da despesa sem letras nem caracteres especiais, separe os decimais com virgula',
  registerPersonalExpenseCategory:
    'Por favor, selecione a categoria da despesa:\n\n',
  registeredPersonalExpense: 'Despesa registrada com sucesso',
  listPersonalExpensesCategories:
    'Por favor, selecione la categoria que deseja consultar: \n\n',
  listPersonalExpenses: 'Suas despesas da categoria {{category}}: \n\n',
  listEmptyPersonalExpenses:
    'Você não tem despesas registradas na categoria {{category}}',
  noRegisteredExpenses: 'Você não tem nenhuma despesa registrada',
  registerCategory: 'Qual o nome da categoria?',
  registeredCategory: 'Categoria {{categoryName}} registrada',
  noRegisteredCategories:
    'Antes de registrar uma despesa, você deve registrar pelo menos uma categoria',
  listCategories: `Categorias:\n\n`,
  invalid: 'Por favor, selecione uma opção correta',
};

/*
•	Desenvolver uma interface de interação: Criar uma interface amigável na qual os usuários consigam registrar, administrar e consultar as despesas de forma rápida e intuitiva no whatsApp
•	Implementar funcionalidades de personalização e controle financeiro: Adicionar funcionalidades que permitam aos usuários categorizar despesas, dividir com outras pessoas, simplificar dívidas e gerar relatórios
•	Fornecer um sistema de notificações: Implementar um sistema que permita adicionar lembretes sobre transações e cobranças automáticos.


•	Desenvolvimento de um bot no WhatsApp que permita gerenciar as despesas pessoais ou grupais de forma amigável, sem aplicativos nem pagamentos adicionais
•	Melhoria no gerenciamento das despesas, de forma mais eficaz e acessível, facilitando o controle financeiro dos usuários em um ambiente conhecido e amplamente utilizado
•	Retroalimentação positiva dos usuários do bot, indicando satisfação em relação à usabilidade e funcionalidade da ferramenta
•	Identificação de oportunidades de melhoria, abrindo a possibilidade de evolução do bot no futuro
•	Adesão positiva à ferramenta, refletindo sua relevância no gerenciamento de despesas

*/
