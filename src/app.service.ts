import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const META_FILE = 'meta.json';
const CONTENT_FILE = 'content.json';

interface Notebook {
  title: string;
  notes: {
    noteMarkdownContent: string;
    created_at: Date;
    tags: string;
    title: string;
    updated_at: Date;
  }[];
}

@Injectable()
export class AppService {
  private notebooks: Notebook[] = [];
  async readDir(fullPath: string) {
    return (await readdir(fullPath)).filter(
      (notebook) => notebook !== META_FILE,
    );
  }

  async readNotes(fullPath: string) {
    const notebooks = await this.readDir(fullPath);
    for (const notebook of notebooks) {
      const notes = await this.readDir(path.join(fullPath, notebook));
      const noteBookMeta = await readFile(
        path.join(fullPath, notebook, META_FILE),
      );
      const { name: noteBookName } = JSON.parse(noteBookMeta.toString());
      const notebookItem = {
        title: noteBookName,
        notes: [],
      };
      for (const note of notes) {
        const noteMarkdownContent = await readFile(
          path.join(fullPath, notebook, note, CONTENT_FILE),
        );
        const { created_at, tags, title, updated_at } = JSON.parse(
          (
            await readFile(path.join(fullPath, notebook, note, META_FILE))
          ).toString(),
        );
        notebookItem.notes.push({
          noteMarkdownContent,
          created_at,
          tags,
          title,
          updated_at,
        });
      }
      this.notebooks.push(notebookItem);
    }
    return this.notebooks;
  }
}
