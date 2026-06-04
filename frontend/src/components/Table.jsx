import React from "react";
import { FiSearch } from "react-icons/fi";

const Table = ({ columns, data, loading, page, hasNext, hasPrevious, onNext, onPrev }) => {
    const skeletonRows = Array.from({ length: 5 });
    
    return (
        <div>
            {!loading && data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-mauve-50 p-4 rounded-full mb-4">
                        <FiSearch size={32} className="text-mauve-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-mauve-900 mb-1">
                        No records found
                    </h3>
                    <p className="text-sm text-mauve-500 max-w-sm">
                        No records found for your request. Try to clear filters.
                    </p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse md:table">
                    <thead className="hidden md:table-header-group">
                        <tr className="border-b border-mauve-200 text-mauve-400 text-xs tracking-wider font-bold uppercase">
                            {columns.map((col, index) => (
                                <th 
                                    key={index} 
                                    className={`pb-3 font-mono font-bold ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                        {loading ? (
                            skeletonRows.map((_, rowIndex) => (
                                <tr 
                                    key={rowIndex} 
                                    className="block md:table-row mb-4  md:mb-0 border-b border-mauve-100 md:border-none md:border-b md:border-mauve-100 rounded-lg bg-white p-3 md:p-0 shadow-sm md:shadow-none"
                                >
                                    {columns.map((col, colIndex) =>(
                                        <td 
                                            key={colIndex} 
                                            className={`flex justify-between items-center md:table-cell py-3 border-b border-mauve-50 md:border-none ${col.className || ''}`}
                                        >
                                            <span className="md:hidden text-sm font-mono text-mauve-400">{col.header}</span>
                                            <div className="h-4 bg-mauve-100 rounded w-1/2  md:w-full animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr 
                                    key={row.id || rowIndex} 
                                    className="block md:table-row mb-4  md:mb-0 border border-mauve-100 md:border-none md:border-b md:border-mauve-100 rounded-xl bg-white p-4 md:p-0 shadow-sm md:shadow-none transition duration-200 hover-bg-mauve-50/40"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td 
                                            key={colIndex} 
                                            className={`flex justify-between items-center md:table-cell py-3.5 px-2 border-b border-mauve-50 md:border-none min-w-0 ${col.className || ''}`}
                                        >
                                            <span className="md:hidden text-xs font-mono font-bold text-mauve-400 uppercase tracking-wider pr-4">
                                                {col.header}
                                            </span>

                                            <div className="text-right md:text-left flex-1 md:flex-none truncate">
                                                {col.render 
                                                ? col.render(row) 
                                                : row[col.accessor]}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {!loading && data && data.length > 0 && page !== undefined && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-mauve-200 mt-6 pt-4 mb-2">
                    <button
                        onClick={onPrev}
                        disabled={!hasPrevious}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-500"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-mauve-500 font-medium">
                        Page {page}
                    </span>
                    <button
                        onClick={onNext}
                        disabled={!hasNext}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-500"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default Table;