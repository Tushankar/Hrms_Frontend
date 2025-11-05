import React from 'react';
import { useParams } from 'react-router-dom';
import HRFormViewer from '../../Components/Hr/HRFormViewer';
import HRNotesInput from '../../Components/Common/HRNotesInput/HRNotesInput';
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, User } from 'lucide-react';

const HRBackgroundCheckViewer = () => {
  const { applicationId } = useParams();

  const additionalInfo = (
    <div className="flex items-center gap-2">
      <Shield className="w-5 h-5 text-blue-600" />
      <span className="text-blue-800 font-medium">
        Background Check contains sensitive information - Handle with confidentiality
      </span>
    </div>
  );

  return (
    <HRFormViewer
      formType="backgroundCheck"
      formTitle="PHS-Background Check Form-Results"
      formDescription="Background verification and screening results"
      apiEndpoint="get-background-check"
      additionalInfo={additionalInfo}
    >
      {({ formData, application }) => (
        <div className="space-y-8">
          {/* Applicant Information */}
          {formData.applicantInfo && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Applicant Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.fullName || 'Not provided'}
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
                    {formData.applicantInfo.ssn 
                      ? `***-**-${formData.applicantInfo.ssn.slice(-4)}`
                      : 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Driver's License</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.driversLicense || 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">State</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.applicantInfo.state || 'Not provided'}
                  </p>
                </div>
              </div>
              
              {formData.applicantInfo.currentAddress && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700">Current Address</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md mt-2">
                    {formData.applicantInfo.currentAddress}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Employment Information */}
          {formData.employmentInfo && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Position Applied For</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.employmentInfo.positionApplied || 'Not specified'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.employmentInfo.department || 'Not specified'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Expected Start Date</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formData.employmentInfo.startDate 
                      ? new Date(formData.employmentInfo.startDate).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Direct Patient Care</label>
                  <div className="flex items-center gap-2">
                    {formData.employmentInfo.directPatientCare ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex-1">
                      {formData.employmentInfo.directPatientCare ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Criminal History Disclosure */}
          {formData.criminalHistory && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Criminal History Disclosure</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center mt-1">
                    {formData.criminalHistory.hasConvictions ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Criminal Convictions</label>
                    <p className="text-gray-900 mt-1">
                      {formData.criminalHistory.hasConvictions ? 'Yes - Details provided below' : 'No convictions'}
                    </p>
                  </div>
                </div>
                
                {formData.criminalHistory.hasConvictions && formData.criminalHistory.convictionDetails && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <label className="text-sm font-medium text-gray-700">Conviction Details</label>
                    <p className="text-gray-900 mt-2 whitespace-pre-wrap">
                      {formData.criminalHistory.convictionDetails}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Authorization and Consent */}
          {formData.consentAcknowledgment && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Authorization & Consent</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center mt-1">
                    {formData.consentAcknowledgment.authorizeBackgroundCheck ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Background Check Authorization</label>
                    <p className="text-gray-900 mt-1">
                      {formData.consentAcknowledgment.authorizeBackgroundCheck 
                        ? 'Authorized - Employee has consented to background check'
                        : 'Not Authorized'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex items-center mt-1">
                    {formData.consentAcknowledgment.accuracyAcknowledgment ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Information Accuracy</label>
                    <p className="text-gray-900 mt-1">
                      {formData.consentAcknowledgment.accuracyAcknowledgment 
                        ? 'Confirmed - Employee acknowledges information accuracy'
                        : 'Not Confirmed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Background Check Results (If available) */}
          {formData.results && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Background Check Results</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">Overall Status</label>
                  <div className="flex items-center gap-2">
                    {formData.results.status === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : formData.results.status === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <p className="text-blue-900 bg-white px-3 py-2 rounded-md flex-1 font-medium">
                      {formData.results.status?.toUpperCase() || 'PENDING'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">Review Date</label>
                  <p className="text-blue-900 bg-white px-3 py-2 rounded-md">
                    {formData.results.reviewDate 
                      ? new Date(formData.results.reviewDate).toLocaleDateString()
                      : 'Not reviewed'}
                  </p>
                </div>
              </div>
              
              {formData.results.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-blue-700">HR Notes</label>
                  <p className="text-blue-900 bg-white px-3 py-2 rounded-md mt-2 whitespace-pre-wrap">
                    {formData.results.notes}
                  </p>
                </div>
              )}
              
              {formData.results.reviewedBy && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700">
                    Reviewed by: <span className="font-medium">{formData.results.reviewedBy}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Signature Information */}
          {(formData.applicantSignature || formData.signatureDate) && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Applicant Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-green-700">Signature Status</label>
                  <p className="text-green-900 mt-1">
                    {formData.applicantSignature ? '✅ Signed' : '❌ Not Signed'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-green-700">Date Signed</label>
                  <p className="text-green-900 mt-1">
                    {formData.signatureDate 
                      ? new Date(formData.signatureDate).toLocaleDateString()
                      : 'Not signed'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* HR Notes Section */}
          <div className="mt-8 border-t pt-6">
            <HRNotesInput
              formType="background-check"
              employeeId={application?.employeeId?._id}
              existingNote={formData?.hrFeedback?.comment}
              existingReviewedAt={formData?.hrFeedback?.reviewedAt}
              onNoteSaved={() => window.location.reload()}
              formId={formData?._id}
            />
          </div>

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

export default HRBackgroundCheckViewer;
