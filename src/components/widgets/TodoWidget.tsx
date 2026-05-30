import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoWidget: React.FC = () => {
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
    <div className="card bg-base-100 shadow-xl border border-base-300 h-80">
      <div className="card-body p-4 flex flex-col h-full">
        <h3 className="card-title text-base-content flex items-center gap-2 mb-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          TODO List
        </h3>

        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            className="input input-bordered input-sm flex-1 bg-base-200 border-base-300"
            placeholder="Add task..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm btn-square">
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="flex-1 overflow-auto space-y-2 pr-1">
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
            <p className="text-center text-base-content/40 text-xs mt-4">No tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoWidget;
