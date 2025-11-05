import React from 'react';
import { useParams } from 'react-router-dom';
import HRFormViewer from '../../Components/Hr/HRFormViewer';
import { User, Phone, Mail, MapPin, Briefcase, Calendar, FileText } from 'lucide-react';

const HREmploymentApplicationViewer = () => {
  const { applicationId } = useParams();

  const additionalInfo = (
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-blue-600" />
      <span className="text-blue-800 font-medium">
        Employment Application contains personal information, employment history, and references
      </span>
    </div>
  );

  return (
    <HRFormViewer
      formType="employmentApplication"
      formTitle="Employment Application"
      formDescription="Personal and professional information for new hire"
      apiEndpoint="get-employment-application"
      additionalInfo={additionalInfo}
    >
      {({ formData, application }) => (
        <div className="space-y-8">
          {/* Personal Information Section */}
          {formData.applicantInfo && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.firstName || 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.lastName || 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.dateOfBirth 
                      ? new Date(formData.applicantInfo.dateOfBirth).toLocaleDateString()
                      : 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Social Security Number</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.socialSecurityNumber 
                      ? `***-**-${formData.applicantInfo.socialSecurityNumber.slice(-4)}`
                      : 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex-1">
                      {formData.applicantInfo.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex-1">
                      {formData.applicantInfo.email || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              {formData.applicantInfo.address && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Address</label>
                  </div>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.address}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Position Information */}
          {formData.positionInfo && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Position Applied For</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Position</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.positionInfo.position || 'Not specified'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.positionInfo.department || 'Not specified'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Desired Start Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex-1">
                      {formData.positionInfo.startDate 
                        ? new Date(formData.positionInfo.startDate).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Salary Expectations</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.positionInfo.salaryExpectations || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Employment History */}
          {formData.employmentHistory && formData.employmentHistory.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Employment History</h3>
              </div>
              
              <div className="space-y-4">
                {formData.employmentHistory.map((job, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company</label>
                        <p className="text-gray-900 mt-1">{job.company || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Position</label>
                        <p className="text-gray-900 mt-1">{job.position || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                        <p className="text-gray-900 mt-1">
                          {job.startDate ? new Date(job.startDate).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">End Date</label>
                        <p className="text-gray-900 mt-1">
                          {job.endDate ? new Date(job.endDate).toLocaleDateString() : job.currentJob ? 'Current' : 'Not provided'}
                        </p>
                      </div>
                      {job.responsibilities && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700">Responsibilities</label>
                          <p className="text-gray-900 mt-1">{job.responsibilities}</p>
                        </div>
                      )}
                      {job.reasonForLeaving && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700">Reason for Leaving</label>
                          <p className="text-gray-900 mt-1">{job.reasonForLeaving}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {formData.education && formData.education.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Institution</label>
                        <p className="text-gray-900 mt-1">{edu.institution || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Degree</label>
                        <p className="text-gray-900 mt-1">{edu.degree || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Field of Study</label>
                        <p className="text-gray-900 mt-1">{edu.fieldOfStudy || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Graduation Year</label>
                        <p className="text-gray-900 mt-1">{edu.graduationYear || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {formData.references && formData.references.length > 0 && (
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">References</h3>
              
              <div className="space-y-4">
                {formData.references.map((ref, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900 mt-1">{ref.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Relationship</label>
                        <p className="text-gray-900 mt-1">{ref.relationship || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company</label>
                        <p className="text-gray-900 mt-1">{ref.company || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900 mt-1">{ref.phone || 'Not provided'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900 mt-1">{ref.email || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Information */}
          {(formData.applicantSignature || formData.signatureDate) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Signature Status</label>
                  <p className="text-gray-900 mt-1">
                    {formData.applicantSignature ? '✅ Signed' : '❌ Not Signed'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date Signed</label>
                  <p className="text-gray-900 mt-1">
                    {formData.signatureDate 
                      ? new Date(formData.signatureDate).toLocaleDateString()
                      : 'Not signed'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Display raw form data for debugging (can be removed in production) */}
          <details className="mt-8 border border-gray-200 rounded-lg">
            <summary className="px-4 py-2 bg-gray-50 cursor-pointer text-sm font-medium text-gray-700">
              View Raw Form Data (Debug)
            </summary>
            <div className="p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </HRFormViewer>
  );
};

export default HREmploymentApplicationViewer;
