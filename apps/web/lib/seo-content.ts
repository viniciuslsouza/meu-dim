export type SeoCalculator =
  | "rotativo"
  | "quitacao"
  | "parcelamento"
  | "emprestimo"
  | "estrategia";

export interface SeoPageContent {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  answer: string;
  calculator: SeoCalculator;
  calculatorTitle: string;
  calculatorDescription: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  related: {
    href: string;
    label: string;
  };
}

export const SEO_PAGES: SeoPageContent[] = [
  {
    slug: "simulador-juros-rotativo",
    title: "Simulador de Juros do Rotativo: quanto você paga no cartão?",
    description:
      "Calcule os juros do rotativo do cartão em 1, 3, 6 e 12 meses e entenda como impedir que a dívida cresça.",
    eyebrow: "Juros do cartão",
    answer:
      "O rotativo faz a dívida crescer por juros compostos todos os meses. Uma dívida de R$ 2.000 a 14% ao mês chega perto de R$ 9.600 em 12 meses se não houver pagamentos: quase cinco vezes o valor inicial.",
    calculator: "rotativo",
    calculatorTitle: "Calcule o crescimento da dívida",
    calculatorDescription:
      "Informe seu saldo e a taxa mensal. O cálculo usa juros compostos e acontece somente no navegador.",
    sections: [
      {
        title: "O que é o rotativo do cartão de crédito?",
        paragraphs: [
          "O crédito rotativo é acionado quando você não paga o valor integral da fatura até o vencimento. A parte não paga vira um financiamento de curtíssimo prazo e recebe juros, IOF e eventuais encargos previstos no contrato. Mesmo quando o banco permite o rotativo por período limitado, seu custo pode comprometer o orçamento rapidamente.",
          "Pagar apenas o mínimo evita o atraso formal, mas não elimina a dívida. O pagamento cobre primeiro encargos e uma parte pequena do principal. Se novas compras continuarem entrando, a próxima fatura combina gastos recentes com o saldo financiado, tornando difícil perceber quanto da renda já está comprometida."
        ]
      },
      {
        title: "Por que os juros são tão altos no Brasil?",
        paragraphs: [
          "As instituições atribuem as taxas ao risco de inadimplência, custos operacionais, impostos e falta de garantias. Para o consumidor, porém, a explicação mais útil é prática: o rotativo está entre as linhas mais caras do mercado e deve ser tratado como emergência, não como extensão da renda.",
          "A taxa varia por banco e perfil. Consulte sua fatura ou contrato em vez de depender apenas de médias. Uma diferença de poucos pontos percentuais ao mês gera grande impacto quando composta durante vários períodos."
        ]
      },
      {
        title: "Como calcular os juros manualmente",
        paragraphs: [
          "A fórmula básica é A = P × (1 + i)ⁿ. P é o saldo inicial, i é a taxa mensal em formato decimal e n é o número de meses. Para uma taxa de 14%, use 0,14. O resultado A mostra o saldo acumulado sem considerar pagamentos ou novas compras.",
          "Esse cálculo simplificado ajuda a visualizar a velocidade do crescimento. O valor real pode incluir IOF, multas e regras específicas. Use a calculadora como referência educativa e confira os números apresentados pelo emissor do cartão."
        ]
      },
      {
        title: "O que acontece se pagar só o mínimo",
        paragraphs: [
          "O mínimo costuma ser um percentual pequeno do saldo ou um valor fixo definido pelo banco. Na prática, ele cobre juros, IOF e uma fatia reduzida do principal. No mês seguinte, o saldo restante volta a receber a taxa cheia, e o ciclo se repete.",
          "Imagine uma fatura de R$ 2.000 a 14% ao mês com mínimo de R$ 300. Os juros do período já passam de R$ 280. Quase todo o pagamento some em encargos, o principal quase não cai e novas compras empurram a próxima fatura para cima. Sem um valor extra, a dívida se alonga por anos.",
          "Por isso o mínimo não deve ser tratado como estratégia. Ele evita o registro imediato de atraso, mas não reduz o custo. Use a calculadora para comparar o crescimento sem pagamento com o efeito de um valor acima dos juros."
        ]
      },
      {
        title: "Como sair do rotativo",
        paragraphs: [
          "O primeiro passo é interromper novas compras no cartão e levantar o saldo total, a taxa e o pagamento mínimo. Compare parcelamento da fatura, empréstimo pessoal e portabilidade pelo custo efetivo total, não apenas pelo valor da parcela.",
          "Escolha um pagamento mensal sustentável acima dos juros do período. Automatize o pagamento, direcione cortes temporários para a dívida e mantenha uma pequena reserva para não recorrer novamente ao cartão diante de qualquer imprevisto.",
          "Se a taxa do rotativo estiver acima de 10% ao mês, priorize sair dessa linha o quanto antes. Mesmo um empréstimo ou parcelamento aparentemente caro pode custar menos do que manter o saldo aberto por alguns meses."
        ]
      },
      {
        title: "Um exemplo numérico para visualizar o custo",
        paragraphs: [
          "Considere R$ 3.000 no rotativo a 14% ao mês. Sem pagamento, o saldo passa de R$ 3.420 no primeiro mês, cerca de R$ 4.440 em três meses e mais de R$ 14.400 em um ano. Esse crescimento não exige novas compras: basta deixar o saldo aberto.",
          "Agora imagine o mesmo saldo com um pagamento de R$ 800 por mês. Parte ainda cobre juros, mas o principal começa a cair. Em poucos meses a diferença para o cenário sem pagamento já passa de milhares de reais. A calculadora desta página reproduz essa conta com os seus números.",
          "Use o resultado como alerta, não como sentença. O objetivo é transformar o choque em um plano: cortar o que for temporário, negociar taxa e escolher entre parcelar, emprestar ou pagar à vista o que for possível."
        ]
      }
    ],
    faqs: [
      { question: "Qual é a taxa do rotativo?", answer: "Ela varia por instituição, produto e histórico do cliente. O número que importa é o da sua fatura: taxa mensal, CET e encargos. Médias de mercado servem só para comparação inicial." },
      { question: "O limite de juros torna o rotativo barato?", answer: "Não. Mesmo com tetos legais, o rotativo continua entre as linhas mais caras do crédito pessoal. Uma dívida pode dobrar em poucos meses se o pagamento não cobrir os juros." },
      { question: "Pagar o mínimo evita juros?", answer: "Não. O mínimo evita parte das consequências imediatas do atraso, mas o saldo restante recebe juros, IOF e encargos. Na prática, quase todo o pagamento some em custo financeiro." },
      { question: "Parcelar a fatura é sempre melhor?", answer: "Costuma ter taxa menor que o rotativo, mas não é automático. Compare CET, prazo, valor total e se a parcela cabe sem novas compras no mesmo cartão." },
      { question: "Posso negociar a dívida?", answer: "Sim. Peça propostas de parcelamento, desconto à vista e portabilidade. Compare o custo total com a calculadora antes de assinar e desconfie de quem cobra adiantado para negociar." }
    ],
    related: {
      href: "/quanto-tempo-para-quitar-cartao",
      label: "Veja também: quanto tempo você levará para quitar o cartão?"
    }
  },
  {
    slug: "quanto-tempo-para-quitar-cartao",
    title: "Calculadora: Quanto tempo para quitar o cartão de crédito?",
    description:
      "Descubra quantos meses levará para quitar o cartão, o total de juros e a data estimada com seu pagamento mensal.",
    eyebrow: "Prazo de quitação",
    answer:
      "O tempo para quitar o cartão depende do saldo, da taxa mensal e principalmente do pagamento fixo. Se o valor pago não superar os juros gerados no mês, a dívida nunca diminui; se superar, a calculadora estima o prazo e o custo total.",
    calculator: "quitacao",
    calculatorTitle: "Descubra sua data de quitação",
    calculatorDescription:
      "Teste pagamentos diferentes e veja instantaneamente como aumentar o valor mensal reduz prazo e juros.",
    sections: [
      {
        title: "Por que o pagamento mínimo demora tanto?",
        paragraphs: [
          "O mínimo é definido para manter o contrato em dia, não para quitar rapidamente. Em dívidas com taxa elevada, grande parte do pagamento cobre apenas os juros. O saldo principal cai pouco e volta a gerar encargos no mês seguinte.",
          "Quando os juros do mês são maiores que o pagamento, ocorre amortização negativa: mesmo pagando, a dívida cresce. A calculadora sinaliza esse cenário como inviável para evitar a falsa impressão de progresso."
        ]
      },
      {
        title: "Juros compostos em português simples",
        paragraphs: [
          "Juros compostos significam juros sobre o saldo atualizado. Se R$ 1.000 viram R$ 1.140 após um mês a 14%, no mês seguinte a taxa incide sobre R$ 1.140, não apenas sobre os R$ 1.000 originais.",
          "Pagamentos frequentes reduzem a base sobre a qual os próximos juros serão calculados. Por isso antecipar valores costuma economizar mais do que guardar dinheiro para fazer uma amortização distante, desde que você preserve uma reserva mínima para emergências."
        ]
      },
      {
        title: "Como escolher um pagamento mensal realista",
        paragraphs: [
          "Some renda líquida e despesas essenciais, reserve uma margem para imprevistos e transforme o restante em uma parcela fixa. Uma meta agressiva que não cabe no orçamento pode levar a novos atrasos e compras no crédito.",
          "Simule três valores: o que você paga hoje, um cenário com pequenos cortes e outro temporariamente mais forte. Compare meses e juros. A diferença ajuda a decidir quais ajustes realmente valem o esforço."
        ]
      },
      {
        title: "Tabela prática: quanto pagar por mês",
        paragraphs: [
          "Para uma dívida de R$ 5.000 a 14% ao mês, o pagamento precisa superar cerca de R$ 700 só para cobrir os juros. Com R$ 800, a quitação ainda é lenta. Com R$ 1.000, o prazo cai de forma visível. Com R$ 1.500, o custo total de juros despenca.",
          "A calculadora desta página atualiza esses números com o seu saldo. Use-a para testar o valor atual, um cenário com cortes e outro temporariamente mais alto. A diferença entre meses e juros mostra se o esforço extra vale a pena.",
          "Não existe um valor mágico igual para todos. O melhor pagamento é o maior valor sustentável: aquele que você consegue manter por vários meses sem criar uma nova fatura no cartão."
        ]
      },
      {
        title: "Passos para acelerar a quitação",
        paragraphs: [
          "Pare de aumentar o saldo, pague antes do vencimento, direcione renda extra e renegocie taxas. Se houver várias dívidas, escolha entre avalanche, que prioriza juros maiores, e bola de neve, que prioriza saldos menores.",
          "Revise o plano todo mês. Se uma despesa cair ou uma renda extra aparecer, aplique a diferença na dívida prioritária. Não reduza automaticamente o pagamento quando uma dívida terminar: transfira o valor para a próxima.",
          "Quem está no rotativo costuma subestimar o prazo. Uma dívida de R$ 8.000 a 14% com pagamento de R$ 900 pode levar mais de um ano e ainda gerar milhares em juros. Subir para R$ 1.200 ou R$ 1.500 muda a data e o custo de forma visível, o que a tabela da calculadora mostra em segundos."
        ]
      },
      {
        title: "O que a calculadora considera e o que ela não considera",
        paragraphs: [
          "A simulação assume taxa constante, pagamento fixo e ausência de novas compras. Ela não inclui IOF, multa por atraso, anuidade ou mudanças unilaterais de taxa. Por isso o resultado é uma estimativa educativa, útil para comparar cenários, e não um contrato.",
          "Mesmo assim, a direção do cálculo é confiável: se o pagamento não cobre os juros, a dívida cresce; se cobre com folga, o prazo encurta. Esse recado já basta para decidir se o valor atual é sustentável ou se é hora de negociar."
        ]
      }
    ],
    faqs: [
      { question: "Quanto devo pagar além do mínimo?", answer: "O suficiente para superar os juros do mês e reduzir o principal, sem comprometer aluguel, comida e transporte. Se o pagamento só cobre juros, a data de quitação não existe." },
      { question: "Antecipar pagamento reduz juros?", answer: "Em geral sim, porque reduz o saldo sobre o qual os próximos juros incidem. Confirme se o emissor abate o valor no principal e se há IOF ou tarifa na antecipação." },
      { question: "A data calculada é garantida?", answer: "Não. É uma estimativa sem novas compras, atrasos ou mudança de taxa. Qualquer gasto extra no cartão empurra a data para frente." },
      { question: "Devo usar toda a reserva para quitar?", answer: "Quase nunca. Preserve uma reserva mínima para emergências. Zerar o cartão e ficar sem colchão costuma gerar uma dívida nova no mês seguinte." },
      { question: "Como calcular com várias dívidas?", answer: "Some os mínimos, defina um orçamento total e compare bola de neve e avalanche. A ordem muda prazo e juros; a calculadora de estratégias faz essa conta." }
    ],
    related: {
      href: "/bola-de-neve-ou-avalanche",
      label: "Compare estratégias para quitar várias dívidas"
    }
  },
  {
    slug: "vale-a-pena-parcelar-fatura",
    title: "Vale a pena parcelar a fatura do cartão? Simule agora",
    description:
      "Compare o parcelamento da fatura com o rotativo e calcule parcela, juros e custo total antes de decidir.",
    eyebrow: "Parcelamento da fatura",
    answer:
      "Parcelar a fatura costuma valer a pena quando a taxa e o custo total são menores que os do rotativo e a parcela cabe no orçamento. A troca só funciona se você parar de criar uma segunda dívida com novas compras no cartão.",
    calculator: "parcelamento",
    calculatorTitle: "Compare parcelamento e rotativo",
    calculatorDescription:
      "Use as taxas da sua fatura para calcular a parcela e o valor total de cada cenário.",
    sections: [
      {
        title: "Rotativo e parcelamento não são a mesma coisa",
        paragraphs: [
          "No rotativo, o saldo não pago recebe uma taxa elevada e permanece aberto. No parcelamento, o banco transforma o saldo em prestações fixas, com prazo e taxa definidos. Isso traz previsibilidade, embora continue sendo uma operação de crédito.",
          "A comparação correta considera o custo efetivo total, que reúne juros, IOF e tarifas. Uma parcela pequena pode esconder prazo longo e custo alto. Sempre verifique quanto será pago do início ao fim."
        ]
      },
      {
        title: "Quando parcelar pode fazer sentido",
        paragraphs: [
          "Pode ser uma saída quando você não consegue pagar integralmente, a taxa oferecida é significativamente menor que a do rotativo e as prestações cabem com folga. Também deve existir um plano para evitar novas compras.",
          "Se houver empréstimo ou portabilidade com CET menor, compare as três opções. Não aceite automaticamente a proposta destacada pelo aplicativo do banco; prazo, seguro embutido e tarifa podem mudar o resultado."
        ]
      },
      {
        title: "A principal armadilha",
        paragraphs: [
          "O maior risco é parcelar e continuar usando o cartão como antes. As prestações ocupam parte do limite e da renda enquanto novas compras formam outra fatura. Em poucos meses, você pode ter parcelamento antigo, fatura atual e outros compromissos concorrendo pelo mesmo dinheiro.",
          "Reduza temporariamente o limite, remova o cartão de aplicativos e acompanhe despesas semanalmente. Essas barreiras simples dão tempo para o orçamento absorver as parcelas sem produzir uma nova bola de neve."
        ]
      },
      {
        title: "Como tomar a decisão",
        paragraphs: [
          "Insira na calculadora o valor não pago, a taxa de parcelamento, o prazo e a taxa do rotativo. Depois confira os mesmos números no contrato. Escolha a alternativa de menor custo que tenha uma parcela sustentável.",
          "Se nenhuma parcela cabe, procure o banco antes do vencimento e apresente sua capacidade real. Uma negociação viável é melhor que um acordo que será quebrado no primeiro imprevisto.",
          "Depois de parcelar, trate as prestações como despesa fixa. Qualquer sobra do orçamento deve ir para amortização antecipada ou para uma reserva, nunca para novas compras no mesmo cartão."
        ]
      },
      {
        title: "Checklist antes de aceitar o parcelamento",
        paragraphs: [
          "Confirme a taxa mensal, o CET, o número de parcelas, o valor da primeira e da última prestação e se existe IOF. Pergunte se o limite fica comprometido e se você pode antecipar sem multa. Anote esses números e compare com o rotativo na calculadora.",
          "Se a taxa do parcelamento estiver perto da do rotativo, o benefício some. Nesse caso, vale pesquisar empréstimo pessoal ou portabilidade. A média de 8% ao mês, usada no botão da calculadora, é apenas um ponto de partida: o número que importa é o da sua fatura.",
          "Por fim, decida o que acontece com o cartão depois do acordo. Sem um limite menor e um orçamento semanal, o parcelamento vira só o primeiro andar de uma dívida maior.",
          "Um exemplo: fatura de R$ 4.000 no rotativo a 14% cresce para cerca de R$ 5.900 em três meses se você pagar só o mínimo. O mesmo valor parcelado a 8% em 12 vezes tem custo conhecido e parcela previsível. A calculadora deixa essa diferença explícita antes de você aceitar a oferta do banco."
        ]
      }
    ],
    faqs: [
      { question: "Parcelar bloqueia o cartão?", answer: "Depende do banco. Em muitos casos parte do limite fica comprometida até o fim das parcelas, o que pode ser útil para impedir novas compras." },
      { question: "Posso antecipar parcelas?", answer: "Sim, normalmente com redução proporcional dos juros futuros. Peça o valor para quitação e confirme se há tarifa antes de antecipar." },
      { question: "O parcelamento tem IOF?", answer: "Pode ter IOF, seguro e tarifas. Por isso compare o CET, não só a taxa divulgada no aplicativo." },
      { question: "Quantas parcelas devo escolher?", answer: "O menor prazo cuja parcela caiba com segurança. Prazo longo reduz a prestação, mas aumenta o custo total e o tempo exposto ao cartão." },
      { question: "É melhor empréstimo ou parcelamento?", answer: "Fica com a opção de menor CET e parcela sustentável. Compare as duas na calculadora de empréstimo usando o mesmo valor e, se possível, o mesmo prazo." }
    ],
    related: {
      href: "/emprestimo-para-quitar-cartao",
      label: "Compare também um empréstimo para quitar o cartão"
    }
  },
  {
    slug: "emprestimo-para-quitar-cartao",
    title: "Empréstimo para quitar cartão: quando vale a pena?",
    description:
      "Compare o custo do cartão com um empréstimo pessoal e descubra parcela, juros e economia potencial.",
    eyebrow: "Troca de dívida",
    answer:
      "Um empréstimo para quitar o cartão vale a pena quando seu custo efetivo é menor, a parcela cabe no orçamento e o cartão deixa de acumular novas compras. Trocar apenas a dívida, sem mudar o comportamento, pode piorar a situação.",
    calculator: "emprestimo",
    calculatorTitle: "Compare cartão e empréstimo",
    calculatorDescription:
      "Informe as taxas reais das propostas para estimar custo, parcela e economia.",
    sections: [
      {
        title: "Quando a troca compensa",
        paragraphs: [
          "Cartão e cheque especial costumam ter taxas maiores que empréstimos com prazo definido. Consolidar o saldo pode reduzir juros e trazer uma data clara de término. A economia, porém, depende da taxa, das tarifas e do prazo.",
          "Uma taxa menor não garante menor custo se o prazo for excessivamente longo. Compare o valor total pago e verifique seguros ou serviços adicionados ao contrato."
        ]
      },
      {
        title: "Onde buscar taxas menores",
        paragraphs: [
          "Consulte seu banco, cooperativas, fintechs e propostas de portabilidade. Quem recebe salário na instituição ou oferece garantia pode encontrar condições melhores. Evite qualquer empresa que cobre depósito antecipado para liberar crédito.",
          "Faça cotações em uma janela curta e mantenha os dados organizados: saldo para quitação, CET mensal e anual, parcela, prazo e total. Negocie mostrando propostas concorrentes."
        ]
      },
      {
        title: "O risco de manter o cartão aberto",
        paragraphs: [
          "Depois que o empréstimo quita a fatura, o limite pode voltar a ficar disponível. Se ele for usado sem planejamento, surgem duas dívidas: a parcela do empréstimo e a nova fatura.",
          "Reduza o limite para um valor compatível com as despesas planejadas, remova compras por impulso e mantenha o pagamento do empréstimo automatizado. A troca de crédito precisa vir acompanhada de um novo orçamento."
        ]
      },
      {
        title: "Portabilidade e cuidados",
        paragraphs: [
          "A portabilidade permite transferir uma dívida para instituição com condição melhor. Solicite ao credor o saldo devedor e compare o CET da nova proposta. Não analise apenas a taxa anunciada.",
          "Leia as regras de quitação antecipada e confirme se a nova parcela mantém uma margem para emergências. Se ela consumir todo o orçamento livre, o risco de voltar ao crédito permanece alto.",
          "Use o empréstimo apenas para quitar o cartão. Misturar a operação com outras despesas dilui o benefício da taxa menor e dificulta acompanhar o progresso."
        ]
      },
      {
        title: "Como ler o resultado da comparação",
        paragraphs: [
          "A calculadora mostra dois caminhos: continuar pagando o cartão com o valor atual ou trocar o saldo por um empréstimo com prazo e taxa definidos. A economia aparece quando o custo total do empréstimo fica abaixo do custo total do cartão.",
          "Se a parcela do empréstimo for maior do que você paga hoje, o alerta vermelho não significa que a operação é inviável. Significa que o orçamento precisa ser recalculado. Uma economia de juros que estoura o mês vira atraso e, de novo, juros.",
          "Depois de contratar, quite o cartão no mesmo dia, confirme o saldo zerado e só então volte a usar o limite com um teto baixo. Sem esse passo, a comparação da calculadora deixa de valer.",
          "Um caso típico: R$ 8.000 no cartão a 14% com pagamento de R$ 1.500. Trocar por um empréstimo a 3,5% em 24 meses quase sempre reduz o custo total, mas a parcela precisa caber depois das contas essenciais. Se não couber, alongar o prazo ou negociar a taxa é melhor do que atrasar a primeira prestação."
        ]
      }
    ],
    faqs: [
      { question: "Qual taxa de empréstimo é boa?", answer: "Uma taxa inferior ao CET atual do cartão, depois de incluir tarifas, seguro e prazo. Uma taxa aparentemente baixa em 36 meses pode custar mais do que uma taxa maior em 12." },
      { question: "Devo cancelar o cartão?", answer: "Não é obrigatório. Reduzir o limite costuma ser suficiente para impedir uma nova fatura enquanto o empréstimo ainda está em curso." },
      { question: "Empréstimo consignado compensa?", answer: "Pode ter taxa menor porque o desconto sai da folha, mas compromete renda futura. Só faça se a parcela couber depois do desconto e se o dinheiro for usado para quitar o cartão." },
      { question: "Posso fazer portabilidade?", answer: "Em muitos contratos, sim. Solicite o saldo para quitação, compare CET e confirme se há custo de antecipação no crédito antigo." },
      { question: "Existe cobrança antecipada?", answer: "Instituições legítimas não exigem depósito prévio para liberar empréstimo. Qualquer pedido de PIX, boleto ou taxa de liberação antecipada é sinal de golpe." }
    ],
    related: {
      href: "/bola-de-neve-ou-avalanche",
      label: "Compare: método bola de neve ou avalanche"
    }
  },
  {
    slug: "bola-de-neve-ou-avalanche",
    title: "Método Bola de Neve ou Avalanche: qual é melhor para sua dívida?",
    description:
      "Compare bola de neve e avalanche com suas próprias dívidas e descubra prazo, juros e ordem de quitação.",
    eyebrow: "Estratégias de quitação",
    answer:
      "A avalanche é mais eficiente financeiramente porque prioriza a maior taxa; a bola de neve pode ser melhor para motivação porque elimina primeiro o menor saldo. A melhor escolha é a estratégia que você consegue seguir sem interromper os pagamentos.",
    calculator: "estrategia",
    calculatorTitle: "Compare as duas estratégias",
    calculatorDescription:
      "Adicione até cinco dívidas e veja prazo, juros e ordem de quitação em cada método.",
    sections: [
      {
        title: "Como funciona a bola de neve",
        paragraphs: [
          "Você paga o mínimo de todas as dívidas e direciona o dinheiro extra para a de menor saldo. Quando ela termina, soma o pagamento liberado à próxima. O valor disponível cresce como uma bola de neve.",
          "A vantagem é psicológica: encerrar uma conta cedo reduz a quantidade de cobranças e gera sensação de progresso. A desvantagem é poder manter uma dívida de juros altos ativa por mais tempo."
        ]
      },
      {
        title: "Como funciona a avalanche",
        paragraphs: [
          "Na avalanche, o extra vai para a dívida com maior taxa mensal, independentemente do saldo. Ao eliminá-la, o foco passa para a próxima taxa. Matematicamente, essa ordem minimiza os juros quando pagamentos e taxas permanecem iguais.",
          "O desafio é que a primeira vitória pode demorar se a dívida mais cara também tiver saldo alto. Acompanhar a redução do saldo, e não apenas contas encerradas, ajuda a manter a motivação."
        ]
      },
      {
        title: "Eficiência financeira ou motivação?",
        paragraphs: [
          "A diferença de juros cresce quando as taxas são muito distintas. Se todas forem parecidas, a economia da avalanche pode ser pequena, tornando a bola de neve uma escolha razoável para quem precisa de resultados visíveis.",
          "Também é possível adotar um método híbrido: eliminar uma dívida pequena para liberar fluxo e depois migrar para as maiores taxas. O essencial é manter todos os mínimos em dia e concentrar o extra em apenas uma prioridade."
        ]
      },
      {
        title: "Como escolher e executar",
        paragraphs: [
          "Liste saldo, taxa e mínimo de cada dívida. Defina um orçamento total, escolha a ordem e automatize os mínimos. Toda renda extra deve seguir para a prioridade atual.",
          "Não diminua o orçamento total quando uma dívida acabar. Transfira integralmente o pagamento liberado. Revise taxas e saldos mensalmente, mas evite trocar de estratégia por impulso antes de medir o progresso.",
          "Um exemplo comum: cartão de R$ 4.000 a 14% e empréstimo de R$ 7.000 a 3,5%. A avalanche ataca o cartão primeiro e economiza juros. A bola de neve pode encerrar o cartão mais cedo se o saldo for o menor, o que ajuda quem precisa ver uma conta sumir para continuar."
        ]
      },
      {
        title: "Exemplos para decidir com números, não com opinião",
        paragraphs: [
          "Se você tem um cartão caro e um empréstimo barato, a avalanche quase sempre economiza dinheiro. A bola de neve só vence no critério psicológico: ela pode encerrar a primeira conta alguns meses antes, o que a calculadora mostra no comparativo.",
          "Se as taxas forem parecidas, a diferença de juros fica pequena. Nesse caso, escolha o método que você consegue manter. Uma estratégia perfeita abandonada no terceiro mês perde para um plano simples seguido até o fim.",
          "Comece listando no máximo cinco dívidas, como a calculadora permite. Some os mínimos e defina um orçamento acima desse total. Sem folga, nenhum método funciona: o extra é o que muda a ordem e a velocidade."
        ]
      }
    ],
    faqs: [
      { question: "Qual método paga menos juros?", answer: "A avalanche tende a pagar menos juros porque o extra vai para a maior taxa. A diferença cresce quando um cartão caro convive com um empréstimo barato." },
      { question: "Qual quita uma dívida primeiro?", answer: "A bola de neve normalmente encerra a menor dívida mais cedo. A calculadora mostra quantos meses essa primeira vitória chega antes da avalanche." },
      { question: "Preciso parar de pagar as outras?", answer: "Não. Mantenha todos os mínimos em dia. O método só define para onde vai o valor extra depois desses mínimos." },
      { question: "Posso mudar de método?", answer: "Sim. Reavalie se a motivação cair, se uma taxa mudar ou se você quitar uma conta e quiser atacar a mais cara." },
      { question: "Funciona com financiamento?", answer: "Pode funcionar, mas confira regras de amortização, carência e custo de antecipação. Nem todo contrato permite abater o principal livremente." }
    ],
    related: {
      href: "/simulador-juros-rotativo",
      label: "Entenda primeiro como os juros do rotativo crescem"
    }
  }
];

export const SEO_PAGE_BY_SLUG = new Map(
  SEO_PAGES.map((page) => [page.slug, page])
);
