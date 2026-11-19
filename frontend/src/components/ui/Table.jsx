/**
 * Набор компонентов для создания стилизованных таблиц.
 * Использование:
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Имя</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Иван</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-soft">
      <table className={`w-full text-sm text-left border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-slate-50/80 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`hover:bg-slate-50/60 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-slate-700 align-middle ${className}`}>
      {children}
    </td>
  );
}