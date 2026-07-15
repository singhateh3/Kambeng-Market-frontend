// src/components/farmer/FilterChips.jsx
export const FilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
    const { category, status } = filters;
    
    if (!category && !status) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Active filters:</span>
            {category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-full border border-green-200">
                    Category: {category}
                    <button 
                        type="button"
                        onClick={() => onRemoveFilter('category')} 
                        className="hover:text-green-900"
                    >
                        ×
                    </button>
                </span>
            )}
            {status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                    Status: {status}
                    <button 
                        type="button"
                        onClick={() => onRemoveFilter('status')} 
                        className="hover:text-blue-900"
                    >
                        ×
                    </button>
                </span>
            )}
            <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-slate-600"
            >
                Clear all
            </button>
        </div>
    );
};