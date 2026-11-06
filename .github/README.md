![](https://img.przknv.cc/t/amm/header.png)

<div align="center">
  <h3><strong>A M E M O R Y M A C H I N E</strong></h3>
</div>

## hey, you found amemorymachine.

so. you're reading a readme. which means you're probably a developer, or deeply lost. either way, welcome.

amemorymachine is a self-hosted markdown editor with a second brain. everything you read, write, hear, or scribble gets ingested, indexed, and made retrievable. OCR pulls text out of images and scans, speech-to-text turns voice into notes. notes live as a retrieval-augmented graph, not a folder tree, so context surfaces on its own instead of getting buried.

it's a markdown editor where the memory underneath actually connects things. i built it because my brain forgets and my notes app doesn't retrieve.

![](https://img.przknv.cc/t/amm/whatitcan.png)

ps. i built this because i wanted a fast, lightweight tool tailored to my own workflow & not another sluggish, bloated electron app like notion.

## why does this exist

here's the honest answer: i was tired.

tired of keeping notes in five different places. tired of notion being a whole subscription, confluence being enterprise-shaped trauma, and obsidian vaults that only i could ever see. tired of writing things down and then never finding them again. i wanted one place - mine, self-hosted, permanent - where writing something down meant it would actually come back to me when it mattered.

so i built amemorymachine. because apparently the solution to "too many tools" is "build another tool." the hubris is not lost on me.

## few screenshots

<table>
  <tr>
    <td><img src="https://img.przknv.cc/t/amm/home.png" width="250" /></td>
    <td><img src="https://img.przknv.cc/t/amm/slash.png" width="250" /></td>
    <td><img src="https://img.przknv.cc/t/amm/space_properties.png" width="250" /></td>
  </tr>
</table>

## what it does

- **realtime markdown editor** — notion-style editing, workspaces, spaces, and pages. the actual writing part, done properly.
- **retrieval-augmented memory** — content is chunked, embedded, and indexed in a vector store. semantic search, direct questions, recency-aware ranking.
- **capture from anywhere** — save notes, attach files, transcribe voice memos, or edit straight from whatsapp, telegram, and discord.
- **automatic OCR** — photos of documents or handwritten notes become searchable text without a manual step.
- **real-time collaboration** — CRDT-synced editing with presence, comments, and shared pages.
- **self-hosted, fully** — your data, your server, your rules. runs on local or self-hosted LLMs. no data leaves unless you say so.
- **open source** — fork it, break it, make it yours. i won't stop you. i'll probably star your fork.

![](https://img.przknv.cc/t/amm/markdown-actions.png)

## what it might become

i have no idea. that's the honest answer and also the exciting one.

right now amemorymachine is personal infrastructure built for me, open-sourced because hoarding code is a bad personality trait. but i can see it becoming a few things:

it could become the go-to self-hosted memory layer — every app you use writes into it, and it answers from everything you've ever given it.

it could get an API layer. a CLI for pushing markdown straight from your editor. probably an obsidian plugin that someone else builds and i take zero credit for.

it could grow a proper multi-user mode — teams, permissions, shared spaces. a studio brain for small builders who don't want to pay for confluence and also have taste.

![](https://img.przknv.cc/t/amm/integrations.png)

or it stays exactly what it is — a quiet, self-contained corner of the internet where i document things. that's also fine. not everything needs to scale.

## the part where i ask something of you

if you use this, break something, or have an opinion - open an issue. if you build something on top of it, tell me. if you think the name is unwieldy, you're right, i know, i like it anyway.

amemorymachine is a living thing. it'll change as i change. that's the point.

good luck out there.

— harsh / @parazeeknova

```text
⠀⠀⠀⠀⢀⠠⠤⠀⢀⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠐⠀⠐⠀⠀⢀⣾⣿⡇⠀⠀⠀⠀⠀⢀⣼⡇⠀⠀⠀⠀    amemorymachine by @parazeeknova
⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⠀⠀⠀⠀⣴⣿⣿⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣿⣿⣿⣇⠀⠀⢀⣾⣿⣿⣿⠀⠀⠀⠀⠀     self-hosted markdown editor
⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠐⠀⡀     with a second brain.
⠀⠀⠀⢰⡿⠉⠀⡜⣿⣿⣿⡿⠿⢿⣿⣿⡃⠀⠀⠂⠄⠀     write it down. it remembers.
⠀⠀⠒⠒⠸⣿⣄⡘⣃⣿⣿⡟⢰⠃⠀⢹⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠚⠉⠀⠊⠻⣿⣿⣿⣿⣮⣤⣤⣿⡟⠁⠘⠠⠁⠀⠀
⠀⠀⠀⠀⠀⠠⠀⠀⠈⠙⠛⠛⠛⠛⠛⠁⠀⠒⠤⠀⠀⠀⠀    - selfhosted, open source, and free to use.
⠨⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⠀⠀⠀⠀⠀⠀
⠁⠃⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
```
