import { useState, useEffect } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";

const PersonalCare = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  // State for signature fields and dates
  const [formData, setFormData] = useState({
    employeeSignature: '',
    employeeDate: null,
    supervisorSignature: '',
    supervisorDate: null
  });

  // State for notes section
  const [notes, setNotes] = useState('');

  // State for application data
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load application data on component mount
  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        if (applicationId) {
          // Here you would typically fetch application data from API
          // For now, we'll set some default data
          setApplicationData({
            employeeName: 'Loading...',
            employeeEmail: 'Loading...',
            applicationId: applicationId
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading application data:', error);
        setLoading(false);
      }
    };

    loadApplicationData();
  }, [applicationId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
        }
        .react-datepicker {
          border: 1px solid #1F3A93;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__header {
          background-color: #1F3A93;
          border-bottom: 1px solid #1F3A93;
        }
        .react-datepicker__current-month {
          color: white;
        }
        .react-datepicker__day-name {
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #1F3A93;
        }
        .react-datepicker__day:hover {
          background-color: #F0F5FF;
        }
      `}</style>
      <div className="h-full flex flex-col">
        {/* Navbar */}
        <Navbar />
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium w-24"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
                  <span className="ml-3 text-gray-600">Loading application data...</span>
                </div>
              </div>
            ) : (
              /* Main Form Container */
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">PHS</span>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">PACIFIC HEALTH SYSTEMS</h1>
                        <p className="text-blue-100">PRIVATE HOMECARE SERVICES</p>
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold mb-2">Personal Care Assistant (PCA) Job Description</h2>
                    <p className="text-blue-100 text-sm">HR Review - Job Description Form</p>
                    {applicationId && (
                      <p className="text-blue-100 text-xs mt-1">Application ID: {applicationId}</p>
                    )}
                  </div>
                </div>

                {/* Job Description Content */}
                <div className="p-6 md:p-8">
                  {/* Position Summary */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Position Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      The Personal Care Assistant (PCA) provides non-medical support services to clients in their homes, helping 
                      them with activities of daily living (ADLs) to enhance their independence, comfort, and safety. The PCA works 
                      under the supervision of a Registered Nurse or designated supervisor.
                    </p>
                  </div>

                  {/* Duties and Responsibilities */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Duties and Responsibilities
                    </h3>
                    <p className="text-gray-700 mb-4">The PCA is responsible for performing the following tasks:</p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Assist with personal hygiene including bathing, grooming, dressing, and toileting.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Provide mobility support, including transferring and ambulation.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Assist with meal preparation and feeding if necessary.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Perform light housekeeping tasks such as laundry, dishes, and sweeping.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Offer companionship and emotional support to clients.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Monitor and report changes in client condition to the supervisor.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Comply with infection control protocols and safety procedures.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Maintain client confidentiality and respect client rights.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Accurately document care and services provided each day.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Qualifications */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Qualifications
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>High school diploma or GED.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Completion of a state-approved PCA training program or equivalent.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Current CPR/First Aid certification.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Must pass background checks and health screenings (e.g., TB test).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Reliable, compassionate, and good interpersonal skills.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Working Conditions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Working Conditions
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      PCAs work in client homes and may encounter a variety of living environments. This role requires physical 
                      effort including lifting, standing, and assisting with mobility. Flexibility in schedule and travel between clients 
                      may be required.
                    </p>
                  </div>

                  {/* Reporting */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Reporting
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      The PCA reports directly to the Supervisory Nurse or designated agency supervisor.
                    </p>
                  </div>

                  {/* Signature Section */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Signatures</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-2">Employee Signature</label>
                          <input
                            type="text"
                            value={formData.employeeSignature}
                            onChange={(e) => handleInputChange('employeeSignature', e.target.value)}
                            placeholder="Type your signature here"
                            className="w-full border-b-2 border-gray-400 bg-transparent pb-2 focus:border-[#1F3A93] focus:outline-none text-gray-800 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Date</label>
                          <div className="relative">
                            <DatePicker
                              selected={formData.employeeDate}
                              onChange={(date) => handleInputChange('employeeDate', date)}
                              placeholderText="Select date"
                              className="w-full border-b-2 border-gray-400 bg-transparent pb-2 focus:border-[#1F3A93] focus:outline-none text-gray-800"
                              dateFormat="MM/dd/yyyy"
                            />
                            <Calendar className="absolute right-2 top-1 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-2">Supervisor's Signature</label>
                          <input
                            type="text"
                            value={formData.supervisorSignature}
                            onChange={(e) => handleInputChange('supervisorSignature', e.target.value)}
                            placeholder="Supervisor signature"
                            className="w-full border-b-2 border-gray-400 bg-transparent pb-2 focus:border-[#1F3A93] focus:outline-none text-gray-800 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Date</label>
                          <div className="relative">
                            <DatePicker
                              selected={formData.supervisorDate}
                              onChange={(date) => handleInputChange('supervisorDate', date)}
                              placeholderText="Select date"
                              className="w-full border-b-2 border-gray-400 bg-transparent pb-2 focus:border-[#1F3A93] focus:outline-none text-gray-800"
                              dateFormat="MM/dd/yyyy"
                            />
                            <Calendar className="absolute right-2 top-1 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">HR Notes</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes about this job description review..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1F3A93] focus:border-[#1F3A93] resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-end mt-3">
                      <span className="text-sm text-gray-500">{notes.length}/500 characters</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500">
                      © 2025 Pacific Health Systems - Private Homecare Services. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Toaster for notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
      </div>
    </Layout>
  );
};

export default PersonalCare;
