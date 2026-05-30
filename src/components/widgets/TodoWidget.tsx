import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoWidget: React.FC = () => {
  const { t } = useTranslation();
  const [todos, setTodos] = useStorage<Todo[]>('todos', [], 'local');
  const [inputValue, setInputValue] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <GlassCard className="h-80" noPadding>
      <div className="p-4 flex flex-col h-full">
        <h3 className="card-title text-base-content flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-primary" />
          {t.widgets.todo.title}
        </h3>

        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            className="input input-bordered input-sm flex-1 bg-base-100/50 border-white/10"
            placeholder={t.widgets.todo.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm btn-square">
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="flex-1 overflow-auto space-y-2 pr-1 custom-scrollbar">
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-base-content/40' : 'text-base-content'}`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3 text-error" />
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <CheckSquare size={32} className="mb-2" />
              <p className="text-xs">{t.widgets.todo.empty}</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default TodoWidget;
