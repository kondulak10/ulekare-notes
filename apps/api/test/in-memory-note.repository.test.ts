import { InMemoryNoteRepository } from '#test/in-memory-note.repository.ts'
import { noteRepositoryContract } from '#test/note-repository.contract.ts'

noteRepositoryContract('InMemoryNoteRepository', async (notes) => new InMemoryNoteRepository(notes))
