import { AppError } from '../domain/errors.js';
export function parseCsv(input) {
  if (Buffer.byteLength(input, 'utf8') > 250000)
    throw new AppError(413, 'CSV_LIMIT', 'CSV files must be under 250 KB.');
  const text = input.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [],
    cell = '',
    quoted = false,
    closed = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
        closed = true;
      } else cell += ch;
    } else if (ch === '"' && !cell && !closed) quoted = true;
    else if (ch === ',' || ch === '\n') {
      row.push(cell);
      cell = '';
      closed = false;
      if (ch === '\n') {
        if (row.some(Boolean)) rows.push(row);
        row = [];
      }
    } else if (ch === '\r' && text[i + 1] === '\n') continue;
    else {
      if (closed || ch === '"') throw new AppError(400, 'CSV_SYNTAX', 'Invalid CSV quoting.');
      cell += ch;
    }
  }
  if (quoted) throw new AppError(400, 'CSV_SYNTAX', 'Unclosed quoted CSV field.');
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  if (rows.length > 501) throw new AppError(422, 'CSV_ROWS', 'Import at most 500 rows at a time.');
  return rows;
}
