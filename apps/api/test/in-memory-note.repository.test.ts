import { InMemoryNoteRepository } from './in-memory-note.repository.ts'
import { noteRepositoryContract } from './note-repository.contract.ts'

noteRepositoryContract('InMemoryNoteRepository', async (notes) => new InMemoryNoteRepository(notes))
