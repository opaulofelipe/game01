# Relatório de validação — A Casa RC1

## Verificações automatizadas aprovadas

- Todos os arquivos `.js` passam em `node --check`.
- Todos os arquivos JSON são parseáveis.
- Imports relativos apontam para arquivos existentes.
- As 18 cenas registradas possuem arquivos correspondentes.
- Transições literais entre cenas apontam para cenas existentes.
- Todos os objetos com `dialogue` referenciam diálogos existentes.
- Todas as memórias apontam para cenas e cenas de retorno existentes.
- Todas as saídas de `rooms.json` apontam para cenas existentes.
- Todos os arquivos de áudio listados no preload existem.
- Arquivos essenciais foram servidos por HTTP local com status 200 e MIME apropriado.

## Quantidade de conteúdo validado

- 18 cenas;
- 69 objetos;
- 107 blocos de diálogo;
- 19 conjuntos de escolhas;
- 6 memórias cadastradas.

## Limitação do ambiente de teste

O navegador headless do ambiente não conseguiu concluir um carregamento integral porque não havia resolução DNS externa disponível para baixar o Phaser do CDN. O projeto mantém dois CDNs de Phaser como fallback no `index.html` e deve ser validado visualmente em uma publicação real do GitHub Pages antes de rotulá-lo como versão 1.0 definitiva.

## Otimização do pacote

- efeitos convertidos de WAV para MP3;
- rádio convertido para MP3;
- músicas recomprimidas para 96 kbps, adequadas à trilha minimalista;
- tamanho total do projeto após otimização: aproximadamente 5,2 MB, sem contar transferência/compressão HTTP adicional;
- `user-scalable=no` removido;
- CDN secundário configurado para o Phaser.