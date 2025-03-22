import { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
function Category() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      fetch("http://localhost:8080/api/danhmuc/getalldanhmuc")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setProducts(data);
        });
    }
    fetchProducts();
  }, []);

  const productHeaders = [
    {
      label: "ID",
      className: "relative text-sm w-12 px-6 sm:w-16 sm:px-8",
      render: (product) => product.id,
    },
    {
      label: "Tên danh mục",
      className:
        "px-3 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-nowrap",
      render: (product) => (
        <a href={`/danh-muc/${product.id}`}>{product.tenDanhMuc}</a>
      ),
    },
    {
      label: "Số lượng sách",
      className:
        "pl-3 pr-4 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-nowrap sm:pr-6",
      render: (item) => "n",
    },
  ];
  return (
    <div className="m-8">
      <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Danh mục</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <a href="/danh-muc/them" className="px-4 py-2 bg-blue-400 text-white rounded-md block w-full order-0 sm:order-1 sm:ml-3">
            Thêm danh mục
          </a>
        </div>
      </div>

      <div className="p-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-md sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="relative max-w-sm text-slate-400 ">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  ></path>
                </svg>
              </div>
              <input
                className="appearance-none w-full border border-slate-300 p-2 pl-10 rounded-md  disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed "
                placeholder="Tìm kiếm danh mục"
              />
            </div>
          </div>

          <DataTable data={products} headers={productHeaders} />
        </div>
      </div>
    </div>
  );
}

export default Category;
