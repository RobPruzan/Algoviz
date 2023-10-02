import { Languages } from '@/lib/language-snippets';

type CodeEntry = { code: string; language: Languages };
const defaultCodeEntry = { code: '', language: 'python' as Languages };
type Reduce = (prev: CodeEntry) => CodeEntry;
export class CodeStorage {
  static getCode(): CodeEntry {
    const entry = localStorage.getItem('code');
    return entry ? (JSON.parse(entry) as CodeEntry) : defaultCodeEntry;
  }

  static setCode(code: CodeEntry | Reduce) {
    if (typeof code === 'function') {
      const entry = CodeStorage.getCode();
      const res = code(entry);

      localStorage.setItem('code', JSON.stringify(res));
      return;
    }
    localStorage.setItem('code', JSON.stringify(code));
  }
}
