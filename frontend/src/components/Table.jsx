import React from "react";
import { FiSearch } from "react-icons/fi";

const Table = ({ columns, data, loading, page, hasNext, hasPrevious, onNext, onPrev }) => {
    return (
        <div>
            {loading &&
            (
                <div className="text-mauve-500">
                    Loading records...
                </div>
            )}
            {!loading && data.length === 0 && (
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
            )}
            {!loading && data.length > 0 && (
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-mauve-200 text-mauve-500 text-sm">
                        {columns.map((col, index) => (
                            <th 
                                key={index} 
                                className={`pb-3 font-mono font-medium ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr 
                            key={row.id || rowIndex} 
                            className="border-b border-mauve-100 hover:bg-mauve-50 transition duration-200"
                        >
                            {columns.map((col, colIndex) => (
                                <td 
                                    key={colIndex} 
                                    className={`py-3 ${col.className || ''}`}
                                >
                                    {col.render 
                                        ? col.render(row) 
                                        : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
                {!loading && data && data.length > 0 && page !== undefined && (
                    <div className="flex items-center justify-between border-t border-mauve-200 mt-4 pt-4 mb-2">
                        <button
                            onClick={onPrev}
                            disabled={!hasPrevious}
                            className="px-4 py-2 text-sm font-medium text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-500"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-mauve-500 font-medium">
                            Page {page}
                        </span>
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className="px-4 py-2 text-sm font-medium text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-500"
                        >
                            Next
                        </button>
                    </div>
                )}
        </div>
    );
}

export default Table;