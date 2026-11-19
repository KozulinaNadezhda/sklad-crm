import { Inbox } from 'lucide-react';

/**
 * Заглушка для пустых списков/таблиц.
 * 
 * @param {React.ReactNode} icon - иконка (по умолчанию Inbox)
 * @param {string} title - главный заголовок
 * @param {string} description - поясняющий текст
 * @param {React.ReactNode} action - опциональная кнопка действия
 */
export default function EmptyState({ 
  icon, 
  title = 'Ничего не найдено', 
  description = 'Попробуйте изменить параметры поиска или фильтры.', 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-slate-200 rounded-xl border-dashed">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}