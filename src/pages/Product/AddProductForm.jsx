import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const AddProductForm = () => {
    const [tieuDe, setTieuDe] = useState('');
    const [gia, setGia] = useState('');
    const [soLuong, setSoLuong] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [moTa, setMoTa] = useState('');
    const [danhMucId, setDanhMucId] = useState('');
    const [tacGiaIds, setTacGiaIds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await Axios.get('http://localhost:8080/api/danhmuc/getalldanhmuc');
                setCategories(res.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchAuthors = async () => {
            try {
                const res = await Axios.get('http://localhost:8080/api/tacgia/getalltacgia');
                setAuthors(res.data);
            } catch (error) {
                console.error('Error fetching authors:', error);
            }
        };

        fetchCategories();
        fetchAuthors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            sachDTO: {
                tieuDe,
                gia: parseFloat(gia),
                soLuong: parseInt(soLuong, 10),
                photoURL,
                moTa,
            },
            danhMucId: parseInt(danhMucId, 10),
            tacGiaIds: tacGiaIds.map(id => parseInt(id, 10)),
        };

        try {
            const res = await Axios.post('http://localhost:8080/api/sach/saveone', productData);
            if (res.status === 200) {
                alert('Thêm sản phẩm thành công');
            } else {
                alert('Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Có lỗi xảy ra');
        }
    };

    return (
        <div className="m-8">
            <div className="mx-auto bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Thêm Sản Phẩm Mới</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Tiêu đề</label>
                        <input
                            type="text"
                            value={tieuDe}
                            onChange={(e) => setTieuDe(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Giá</label>
                        <input
                            type="number"
                            value={gia}
                            onChange={(e) => setGia(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Số lượng</label>
                        <input
                            type="number"
                            value={soLuong}
                            onChange={(e) => setSoLuong(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Photo URL</label>
                        <input
                            type="text"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Mô tả</label>
                        <textarea
                            value={moTa}
                            onChange={(e) => setMoTa(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Danh mục</label>
                        <select
                            value={danhMucId}
                            onChange={(e) => setDanhMucId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.tenDanhMuc}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Tác giả</label>
                        <select
                            multiple
                            value={tacGiaIds}
                            onChange={(e) => setTacGiaIds(Array.from(e.target.selectedOptions, option => option.value))}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                    {author.tenTacGia}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Thêm Sản Phẩm
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProductForm;
