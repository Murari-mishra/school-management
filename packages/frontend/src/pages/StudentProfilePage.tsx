import React from 'react';

const StudentProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Student Profile</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Student profile details will be displayed here.</p>
      </div>
    </div>
  );
};

export default StudentProfilePage;