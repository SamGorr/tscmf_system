import React, { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const MOCK_GUIDELINES = [
  {
    id: 1,
    title: 'Sanctions Compliance',
    description: 'Guidelines for checking entities against sanctions lists',
    category: 'Compliance',
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    title: 'Environmental Assessment',
    description: 'Guidelines for environmental impact assessment',
    category: 'ESG',
    lastUpdated: '2024-01-10'
  },
  {
    id: 3,
    title: 'Credit Risk Evaluation',
    description: 'Guidelines for assessing credit risk of transactions',
    category: 'Risk',
    lastUpdated: '2024-01-05'
  }
];

const Guidelines = () => {
  const [guidelines, setGuidelines] = useState(MOCK_GUIDELINES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    document: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGuideline) {
      setGuidelines(prev => prev.map(guide => 
        guide.id === editingGuideline.id 
          ? { 
              ...guide, 
              ...formData, 
              lastUpdated: new Date().toISOString().split('T')[0] 
            } 
          : guide
      ));
    } else {
      setGuidelines(prev => [...prev, {
        id: Date.now(),
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      }]);
    }
    setFormData({ title: '', description: '', category: '', document: null });
    setEditingGuideline(null);
    setIsModalOpen(false);
  };

  const handleEdit = (guideline) => {
    setEditingGuideline(guideline);
    setFormData({
      title: guideline.title,
      description: guideline.description,
      category: guideline.category,
      document: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setGuidelines(prev => prev.filter(guide => guide.id !== id));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingGuideline(null);
            setFormData({ title: '', description: '', category: '', document: null });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Guideline
        </button>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Updated</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {guidelines.map((guideline) => (
              <tr key={guideline.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{guideline.title}</td>
                <td className="px-3 py-4 text-sm text-gray-500">{guideline.description}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{guideline.category}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{guideline.lastUpdated}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    onClick={() => handleEdit(guideline)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(guideline.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingGuideline ? 'Edit Guideline' : 'Add New Guideline'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Document</label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="document-upload"
                    accept=".pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    Upload Document
                  </label>
                  {formData.document && (
                    <span className="ml-2 text-sm text-gray-500">
                      {formData.document.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingGuideline ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guidelines; 