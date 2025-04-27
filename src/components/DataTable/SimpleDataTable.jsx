import React from "react";

function DataTable({ data, headers }) {
  return (
    <div className="px-4 py-5 sm:px-6 -mx-4 -my-5 sm:-mx-6">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle overflow-x-auto">
          <div className="relative overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="border-t border-slate-200 bg-slate-50">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} scope="col" className={header.className}>
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((item, index) => (
                  <tr key={index} className="relative hover:bg-slate-50">
                    {headers.map((header, index) => (
                      <td key={index} className={header.className}>
                        {header.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
