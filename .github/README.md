<img src="https://img.przknv.cc/t/verso.png" width="96" alt="amemorymachine logo" />

# one app. two minds.

**a self-hosted markdown editor with second-brain capabilities.**

everything you read, write, hear, or scribble gets ingested, indexed, and made retrievable — notes, documents, and long-term memory, with realtime markdown editing and workspace management.

## hey, you found amemorymachine.

so. you're reading a readme. which means you're probably a developer, or deeply lost. either way, welcome.

amemorymachine is a self-hosted markdown editor with a second brain. everything you read, write, hear, or scribble gets ingested, indexed, and made retrievable. OCR pulls text out of images and scans, speech-to-text turns voice into notes. notes live as a retrieval-augmented graph, not a folder tree, so context surfaces on its own instead of getting buried.

it's a markdown editor where the memory underneath actually connects things. i built it because my brain forgets and my notes app doesn't retrieve.

ps. i built this because i wanted a fast, lightweight tool tailored to my own workflow & not another sluggish, bloated electron app like notion.

## why does this exist

here's the honest answer: i was tired.

tired of keeping notes in five different places. tired of notion being a whole subscription, confluence being enterprise-shaped trauma, and obsidian vaults that only i could ever see. tired of writing things down and then never finding them again. i wanted one place - mine, self-hosted, permanent - where writing something down meant it would actually come back to me when it mattered.

so i built amemorymachine. because apparently the solution to "too many tools" is "build another tool." the hubris is not lost on me.

## what is amemorymachine

the whole knowledge base is retrieval-augmented: markdown content is chunked, embedded, and stored in a vector index so it can be searched semantically and asked questions about directly, with recency-aware ranking so recent memory entries surface above older ones when relevant.

content can be captured from anywhere a whatsapp message can save a note, attach a file, transcribe a voice memo, or edit existing content, with the same capture and chat flow also available through telegram and discord. photos of documents or handwritten notes are OCR'd automatically into searchable text.

|                                                                                                                                                                                 |                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **private mind**<br/>a full markdown workspace — notes, documents, and long-term memory — with docmost-style editing, workspace management, and a vector index over every page. | **capture from anywhere**<br/>save notes, attach files, transcribe voice memos, or edit content straight from whatsapp, telegram, and discord. |
| **retrieval-augmented**<br/>markdown is chunked, embedded, and indexed for semantic search and direct questions, ranked by recency so fresh memory floats up.                   | **automatic OCR**<br/>photos of documents or handwritten notes are transcribed into searchable text without a manual step.                     |

## few screenshots

<table>
  <tr>
    <td align="center"><img src="https://img.przknv.cc/t/amemorymachine/home.png" width="250" alt="home dashboard with quick actions, spaces, and recent pages" /><br/><sub>home spaces, quick actions, recents</sub></td>
    <td align="center"><img src="https://img.przknv.cc/t/amemorymachine/slash.png" width="250" alt="editor slash menu with text, headings, lists, and blocks" /><br/><sub>editor slash menu</sub></td>
    <td align="center"><img src="https://img.przknv.cc/t/amemorymachine/space_properties.png" width="250" alt="workspace space settings with members, groups, and security" /><br/><sub>spaces members, groups, settings</sub></td>
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

## see amemorymachine in action

1. **slash menu**
   type `/` to insert headings, code blocks, tables, diagrams, and more.

2. **smart mentions**
   mention team members with `@` or link internal pages inline.

   ```md
   assigned to @alice — please review the [[deployment guide]]
   ```

3. **search**
   find pages in seconds. full-text search across all content including pdf and docx attachments.

4. **powerful editor**
   rich text editor with tables, code blocks, markdown, diagrams, and real-time collaboration. see cursors and edits live.

> `@mentions` people and `[[links]]` internal pages.
> people online: @alice, @bob, @carol · recent: `handbook.md`, `runbooks.md`

## what it might become

i have no idea. that's the honest answer and also the exciting one.

right now amemorymachine is personal infrastructure built for me, open-sourced because hoarding code is a bad personality trait. but i can see it becoming a few things:

it could become the go-to self-hosted memory layer — every app you use writes into it, and it answers from everything you've ever given it.

it could get an API layer. a CLI for pushing markdown straight from your editor. probably an obsidian plugin that someone else builds and i take zero credit for.

it could grow a proper multi-user mode — teams, permissions, shared spaces. a studio brain for small builders who don't want to pay for confluence and also have taste.

## integrations

seamlessly embed and integrate with your existing tools. from diagrams to databases, bring all your content together.

|            <img src="https://cdn.simpleicons.org/figma" width="32" height="32" alt="figma" /><br/>figma             |                                                    <img src="https://cdn.simpleicons.org/airtable" width="32" height="32" alt="airtable" /><br/>airtable                                                    | <img src="https://cdn.simpleicons.org/googledrive" width="32" height="32" alt="google drive" /><br/>google drive |                                                             <img src="https://cdn.simpleicons.org/mermaid" width="32" height="32" alt="mermaid" /><br/>mermaid                                                              | <img src="https://cdn.simpleicons.org/diagramsdotnet" width="32" height="32" alt="draw.io" /><br/>draw.io |                                                     <img src="https://cdn.simpleicons.org/excalidraw" width="32" height="32" alt="excalidraw" /><br/>excalidraw                                                     |
| :-----------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://cdn.simpleicons.org/googlesheets" width="32" height="32" alt="google sheets" /><br/>google sheets | <picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/miro/white" /><img src="https://cdn.simpleicons.org/miro" width="32" height="32" alt="miro" /></picture><br/>miro |            <img src="https://cdn.simpleicons.org/loom" width="32" height="32" alt="loom" /><br/>loom             | <picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/typeform/white" /><img src="https://cdn.simpleicons.org/typeform" width="32" height="32" alt="typeform" /></picture><br/>typeform |       <img src="https://cdn.simpleicons.org/lumen" width="32" height="32" alt="lumen" /><br/>lumen        | <picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/github/white" /><img src="https://cdn.simpleicons.org/github" width="32" height="32" alt="github" /></picture><br/>github |

- **draw.io** — create flowcharts, uml, network diagrams, and org charts with hundreds of built-in shape libraries.
- **excalidraw** — sketch ideas with a natural, hand-drawn style. perfect for quick whiteboarding and visual brainstorming.
- **mermaid** — write diagrams using simple text syntax. mermaid turns markdown-like text into flowcharts, sequence diagrams, and more.

or it stays exactly what it is — a quiet, self-contained corner of the internet where i document things. that's also fine. not everything needs to scale.

## the part where i ask something of you

if you use this, break something, or have an opinion - open an issue. if you build something on top of it, tell me. if you think the name is unwieldy, you're right, i know, i like it anyway.

amemorymachine is a living thing. it'll change as i change. that's the point.

good luck out there.

— harsh / @parazeeknova
