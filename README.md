# A CASA — Release Candidate 1

**A Casa** é um RPG narrativo 2D curto sobre luto, memória e despedida. Daniel retorna à casa do pai falecido para organizar seus pertences e, ao fazê-lo, encontra lembranças da relação entre os dois.

## Estado atual

Esta versão contém a história jogável do início ao fim e reúne os sistemas planejados para a primeira publicação web:

- exterior, sala, cozinha, oficina, quarto de Antônio, antigo quarto de Daniel e quintal;
- cinco memórias narrativas + releitura das mensagens após a discussão;
- sequência final de apagar as luzes, escolher um objeto e fechar a casa;
- epílogo variável conforme o objeto escolhido;
- 69 objetos interativos cadastrados;
- objetos opcionais e pequenas cenas de humor/rotina;
- Guardar / Doar / Descartar / Deixar em objetos selecionáveis;
- consequências persistentes no save;
- casa progressivamente mais vazia;
- personagens em pixel-art procedural com animação simples de caminhada;
- iluminação e temperatura de cor diferentes para presente, memória e despedida;
- 17 efeitos sonoros e 6 faixas instrumentais originais integradas;
- menu inicial, pausa, configurações, controles, histórico de diálogo e créditos;
- autosave com indicador visual;
- acessibilidade e controles touch;
- arquitetura modular com narrativa em JSON.

## Controles

### Computador

- **WASD / setas** — mover;
- **E / Espaço / Enter** — interagir e avançar;
- **← / →** — mudar opção;
- **Esc** — pausar.

### Celular / tablet

- direcional virtual — mover;
- botão **E** — interagir;
- botão **Ⅱ** — pausar.

A orientação horizontal é recomendada, mas o jogo não bloqueia a vertical.

## Acessibilidade

Em **Configurações** é possível ajustar:

- volume geral, música, ambiente e efeitos;
- texto médio, grande ou muito grande;
- velocidade lenta, normal, rápida ou instantânea;
- fonte de alta legibilidade;
- contraste elevado;
- legendas para sons narrativamente importantes;
- redução de movimento;
- redução de efeitos ambientais;
- indicadores de interação mais visíveis e com área maior;
- exibição dos objetivos;
- ajuda opcional de navegação;
- lado e opacidade dos controles touch.

O menu de pausa inclui **Histórico**, com as falas recentes.

## Estrutura

```text
/
├── index.html
├── styles.css
├── .nojekyll
├── assets/
│   └── audio/
│       ├── music/
│       └── sfx/
├── data/
│   ├── objects.json
│   ├── dialogues.json
│   ├── choices.json
│   ├── memories.json
│   └── rooms.json
└── src/
    ├── main.js
    ├── config/
    ├── entities/
    ├── scenes/
    ├── systems/
    ├── ui/
    └── utils/
```

## Arquitetura

O JavaScript cuida de **como** o jogo funciona. Os JSONs descrevem **o que** existe na narrativa.

- `objects.json` — objetos, posições e tipos de interação;
- `dialogues.json` — textos narrativos;
- `choices.json` — escolhas;
- `memories.json` — gatilhos e retornos das memórias;
- `rooms.json` — conexões entre ambientes.

Sistemas centrais incluem `SaveSystem`, `AudioSystem`, `SettingsSystem`, `HouseStateSystem`, `DialogueSystem`, `ChoiceSystem` e `ProgressSystem`.

## Save

O progresso é salvo automaticamente em `localStorage`.

O autosave ocorre durante decisões, memórias e mudanças relevantes de estado. O jogo utiliza um único save, adequado à duração curta da experiência.

## Áudio

A pasta `assets/audio/music` contém seis faixas:

1. tema principal;
2. rotina;
3. memórias;
4. quintal;
5. despedida;
6. epílogo.

Os efeitos estão em MP3 para reduzir o tamanho total do download e manter ampla compatibilidade web.

## Executar localmente

Por usar ES Modules e JSONs, não abra diretamente por `file://`.

Exemplo com Python:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## GitHub Pages

Não existe etapa de build nem backend.

1. envie o conteúdo desta pasta para a raiz do repositório;
2. em **Settings → Pages**, publique a branch principal pela raiz;
3. aguarde a publicação;
4. abra a URL do GitHub Pages.

O Phaser 4.2.1 é carregado por CDN. O `index.html` possui um CDN secundário como fallback.

## Validação realizada

Foram executadas verificações automatizadas de:

- sintaxe de todos os módulos JavaScript;
- validade de todos os JSONs;
- imports relativos;
- cenas e transições;
- objetos → diálogos;
- memórias → cenas;
- conexões entre cômodos;
- existência de todos os arquivos de áudio carregados;
- respostas HTTP locais para arquivos essenciais.

Consulte `TEST_REPORT.md`.

## Playtest

A estrutura está pronta para publicação como **release candidate**. O que não pode ser substituído por teste automatizado é o playtest humano de ritmo, emoção, legibilidade em aparelhos reais e preferências de mixagem. Há um roteiro em `PLAYTEST.md` para isso.