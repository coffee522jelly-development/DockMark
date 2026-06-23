import React, { useState } from 'react';
import { Calculator, Delete } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const CalculatorWidget: React.FC = () => {
  const { t } = useTranslation();
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState<string | null>(null);

  // Helper to safely evaluate the expression without eval/new Function
  const evaluateExpression = (expr: string) => {
    try {
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');

      const tokens = sanitized.match(/(\d+\.?\d*|\+|\-|\*|\/)/g);
      if (!tokens) return null;

      const pass1: string[] = [];
      for(let i=0; i<tokens.length; i++){
          if (tokens[i] === '-' && (i === 0 || ['+', '-', '*', '/'].includes(tokens[i-1]))) {
              pass1.push('-' + tokens[i+1]);
              i++;
          } else {
              pass1.push(tokens[i]);
          }
      }

      const pass2: string[] = [];
      for(let i=0; i<pass1.length; i++){
          if (pass1[i] === '*' || pass1[i] === '/') {
              const prev = parseFloat(pass2.pop() || '0');
              const next = parseFloat(pass1[++i]);
              if (pass1[i-1] === '*') pass2.push((prev * next).toString());
              else pass2.push((prev / next).toString());
          } else {
              pass2.push(pass1[i]);
          }
      }

      let result = parseFloat(pass2[0]);
      for(let i=1; i<pass2.length; i+=2){
          const op = pass2[i];
          const next = parseFloat(pass2[i+1]);
          if (op === '+') result += next;
          else if (op === '-') result -= next;
      }

      if (Number.isFinite(result)) {
        return result;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleInput = (val: string) => {
    if (result !== null) {
      if (['+', '-', '×', '÷'].includes(val)) {
        setExpression(result + val);
      } else {
        setExpression(val);
      }
      setResult(null);
      return;
    }

    setExpression((prev) => {
      if (prev === '0' && val !== '.') {
        return ['+', '-', '×', '÷'].includes(val) ? prev + val : val;
      }
      return prev + val;
    });
  };

  const handleCalculate = () => {
    const calcResult = evaluateExpression(expression);
    if (calcResult !== null) {
      // Limit decimals
      const formattedResult = Number.isInteger(calcResult) ? calcResult.toString() : parseFloat(calcResult.toFixed(8)).toString();
      setResult(formattedResult);
      setExpression(formattedResult);
    } else {
      setResult('Error');
    }
  };

  const handleDelete = () => {
    if (result !== null) {
      setResult(null);
      setExpression('0');
      return;
    }
    setExpression((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleClear = () => {
    setExpression('0');
    setResult(null);
  };

  // Base conversions (BIN, HEX, DEC) - use current expression or result if integer
  let intValue: number | null = null;
  const displayValue = result !== null ? result : expression;
  const lastNumMatch = displayValue.match(/[-]?\d+$/); // Simple extraction of last typed number

  if (lastNumMatch) {
     const num = parseInt(lastNumMatch[0], 10);
     if (!isNaN(num)) intValue = num;
  }

  const hexVal = intValue !== null ? intValue.toString(16).toUpperCase() : '---';
  const binVal = intValue !== null ? intValue.toString(2) : '---';
  const decVal = intValue !== null ? intValue.toString(10) : '---';


  return (
    <GlassCard className="aspect-square overflow-hidden" noPadding>
      <div className="p-2 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-4 h-4 text-primary" />
          <h3 className="card-title text-sm text-base-content m-0 leading-none">
            {t.widgets.calculator.title}
          </h3>
        </div>

        {/* Display Area */}
        <div className="bg-base-200/50 rounded-xl p-1 mb-1 flex-shrink-0 text-right min-h-[1.5rem] flex flex-col justify-end border border-base-300">
          <div className="text-base font-mono text-base-content tracking-tighter truncate overflow-hidden">
             {expression}
          </div>
        </div>

        {/* Programmer Conversion Area */}
        <div className="grid grid-cols-3 gap-1 mb-0.5 text-xs font-mono flex-shrink-0">
          <div className="bg-base-300/30 rounded p-0.5 overflow-hidden">
            <span className="text-primary/70 font-bold mr-1">HEX</span>
            <span className="text-base-content/70 truncate block">{hexVal}</span>
          </div>
          <div className="bg-base-300/30 rounded p-0.5 overflow-hidden">
            <span className="text-secondary/70 font-bold mr-1">DEC</span>
            <span className="text-base-content/70 truncate block">{decVal}</span>
          </div>
          <div className="bg-base-300/30 rounded p-0.5 overflow-hidden">
            <span className="text-accent/70 font-bold mr-1">BIN</span>
            <span className="text-base-content/70 truncate block">{binVal}</span>
          </div>
        </div>

        {/* Keypad */}
        <div className="flex-1 grid grid-rows-5 gap-0.5">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-0.5">
            <button onClick={handleClear} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-error/10 hover:bg-error/20 text-error col-span-2">C</button>
            <button onClick={handleDelete} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/30 flex items-center justify-center text-warning"><Delete size={14}/></button>
            <button onClick={() => handleInput('÷')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-primary/10 hover:bg-primary/20 text-primary">÷</button>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-0.5">
            <button onClick={() => handleInput('7')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">7</button>
            <button onClick={() => handleInput('8')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">8</button>
            <button onClick={() => handleInput('9')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">9</button>
            <button onClick={() => handleInput('×')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-primary/10 hover:bg-primary/20 text-primary">×</button>
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-4 gap-0.5">
            <button onClick={() => handleInput('4')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">4</button>
            <button onClick={() => handleInput('5')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">5</button>
            <button onClick={() => handleInput('6')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">6</button>
            <button onClick={() => handleInput('-')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-primary/10 hover:bg-primary/20 text-primary">-</button>
          </div>
          {/* Row 4 */}
          <div className="grid grid-cols-4 gap-0.5">
            <button onClick={() => handleInput('1')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">1</button>
            <button onClick={() => handleInput('2')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">2</button>
            <button onClick={() => handleInput('3')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">3</button>
            <button onClick={() => handleInput('+')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-primary/10 hover:bg-primary/20 text-primary">+</button>
          </div>
          {/* Row 5 */}
          <div className="grid grid-cols-4 gap-0.5">
            <button onClick={() => handleInput('0')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10 col-span-2">0</button>
            <button onClick={() => handleInput('.')} className="btn btn-xs min-h-0 h-full p-0 btn-ghost bg-base-300/10">.</button>
            <button onClick={handleCalculate} className="btn btn-xs min-h-0 h-full p-0 btn-primary">=</button>
          </div>
        </div>

      </div>
    </GlassCard>
  );
};

export default CalculatorWidget;
