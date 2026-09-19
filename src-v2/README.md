# A Casa — reconstrução v2

Esta pasta contém a nova base jogável.

## Regra principal

Nada dentro de `src/` deve servir de base visual ou física para a reconstrução.

A versão anterior permanece na branch `main` apenas como referência histórica.

## Conteúdo reaproveitável

- roteiro;
- estrutura narrativa;
- diálogos;
- memórias;
- lista de objetos;
- escolhas;
- personagens.

## Estado atual

### Passo 1
Base nova isolada da versão antiga.

### Passo 2
Sistema de movimentação novo implementado em:

- `entities/Player.js`;
- `systems/InputController.js`;
- `render/DanielSpriteFactory.js`;
- `scenes/MovementTestScene.js`.

O personagem possui movimentação em quatro direções, animação, velocidade normalizada, hitbox somente nos pés e controles por teclado e toque.

## Critério de avanço

Nenhuma etapa é considerada pronta apenas porque existe código.

Cada etapa precisa funcionar visualmente e fisicamente em jogo antes de virar base para a seguinte.
