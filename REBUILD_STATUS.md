# Reconstrução do jogo — status

## Passo 1 — concluído

- A branch `main` foi congelada como versão antiga.
- A branch `rebuild-v2` foi criada.
- A nova branch usa exclusivamente `src-v2/`.
- As cenas antigas permanecem apenas como referência.
- Os dados narrativos em `data/` foram preservados.

## Passo 2 — concluído

A movimentação de Daniel foi reconstruída do zero.

### Implementado

- quatro direções: cima, baixo, esquerda e direita;
- três quadros visuais por direção;
- animação de caminhada independente para cada direção;
- estado parado preservando a última direção;
- velocidade fixa de 132 px/s;
- movimento diagonal normalizado, sem aumento artificial de velocidade;
- hitbox de 14 × 9 px concentrada somente nos pés;
- profundidade visual baseada na posição Y do personagem;
- sombra independente sob Daniel;
- limites físicos da área de teste;
- teclado com WASD e setas;
- direcional touch para celular/tablet;
- cancelamento de movimento quando a janela perde foco;
- cena específica de validação de movimento;
- tecla H para visualizar a hitbox dos pés;
- indicador em tempo real de direção e velocidade.

### Observação

O sprite desta etapa é provisório. O objetivo do Passo 2 é aprovar comportamento e física do personagem. A arte definitiva será integrada posteriormente sem alterar o sistema de movimento.

### Critério antes do próximo passo

Validar na prática:

1. caminhada nas quatro direções;
2. diagonais sem aceleração;
3. resposta imediata ao soltar a tecla/toque;
4. funcionamento do direcional no celular;
5. hitbox acompanhando apenas os pés.

## Próximo passo

Passo 3: construir apenas a sala com direção visual nova, sem reutilizar o cenário geométrico antigo.
