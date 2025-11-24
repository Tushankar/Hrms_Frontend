import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../Components/Common/layout/Layout';
import Navbar from '../../Components/Common/Navbar/Navbar';

const ViewEmployeeTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  // Redirect to the full application form
  React.useEffect(() => {
    navigate(`/employee/application-form/${taskId}`);
  }, [navigate, taskId]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-gray-600">Redirecting to application form...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewEmployeeTask;
