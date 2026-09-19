# Reconstrução do jogo — status

## Passo 1 — concluído

- A branch `main` foi congelada como versão antiga.
- A branch `rebuild-v2` foi criada.
- O jogo antigo continua preservado na `main`.
- A nova branch deixou de carregar `src/main.js`.
- A reconstrução usa exclusivamente `src-v2/`.
- As cenas antigas permanecem no repositório apenas como referência e não são executadas.
- Os arquivos narrativos em `data/` foram preservados para reaproveitamento seletivo.
- Uma página mínima de fundação substitui temporariamente o jogo antigo na branch de reconstrução.

## Próximo passo

Passo 2: reconstruir a movimentação de Daniel do zero, com sprite de quatro direções, hitbox nos pés e testes de teclado/touch.
