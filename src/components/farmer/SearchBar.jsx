// src/components/farmer/SearchBar.jsx
import { forwardRef } from 'react';

export const SearchBar = forwardRef(({
    value,
    onChange,
    onFocus,
    onClear,
    onSubmit,
    showSuggestions,
    searchHistory,
    onHistoryClick,
    onClearHistory,
    suggestionsRef,
    searchContainerRef,
    onSuggestionMouseDown,
    categories,
    categoryFilter,
    onCategoryChange,
    statusFilter,
    onStatusChange,
}, ref) => {
    return (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Search Input with Suggestions Container */}
            <div className="relative flex-1" ref={searchContainerRef}>
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={ref}
                        type="text"
                        placeholder="Search products by name, category, or description..."
                        value={value}
                        onChange={onChange}
                        onFocus={onFocus}
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 outline-none focus:border-green-400 focus:bg-white transition"
                        autoComplete="off"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                    <div 
                        ref={suggestionsRef}
                        className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-60 overflow-y-auto"
                        onMouseDown={onSuggestionMouseDown}
                    >
                        {!value && searchHistory.length > 0 && (
                            <div className="p-2">
                                <div className="text-xs text-slate-400 px-2 py-1">Recent searches</div>
                                {searchHistory.map((term, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => onHistoryClick(term)}
                                        onMouseDown={onSuggestionMouseDown}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {term}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={onClearHistory}
                                    onMouseDown={onSuggestionMouseDown}
                                    className="w-full text-left px-3 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    Clear search history
                                </button>
                            </div>
                        )}
                        {value && value.trim().length > 0 && (
                            <div className="border-t border-slate-100 p-2">
                                <button
                                    type="submit"
                                    onMouseDown={onSuggestionMouseDown}
                                    className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search for "{value}"
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Category Filter */}
            <select
                value={categoryFilter}
                onChange={onCategoryChange}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none focus:border-green-400 focus:bg-white transition sm:w-48 cursor-pointer"
            >
                <option value="">All categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {/* Status Filter */}
            <select
                value={statusFilter}
                onChange={onStatusChange}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none focus:border-green-400 focus:bg-white transition sm:w-40 cursor-pointer"
            >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="sold">Sold out</option>
            </select>
        </form>
    );
});

SearchBar.displayName = 'SearchBar';