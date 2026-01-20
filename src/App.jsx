import { DocumentManagement } from "./Pages/Hr/DocumentManagement";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./Pages/Admin/Dashboard";
import { EmployeeDashboard } from "./Pages/Employee/EmployeeDashboard";
import { Login } from "./Pages/auth/Login/Login";
import { Register } from "./Pages/auth/Register/Register";
import { UserManagement } from "./Pages/Admin/UserManagement";
import { MonitorSystem } from "./Pages/Admin/MonitorSystem";
import { ErrorLogs } from "./Pages/Admin/ErrorLogs";
import { PersonalDetails } from "./Pages/Employee/PersonalDetails";
import { Communications } from "./Pages/Employee/Communications";
import { TrainingResources } from "./Pages/Employee/TrainingResources";
import { HrDashboard } from "./Pages/Hr/HrDashboard";
import { Taskmanagement } from "./Pages/Hr/Taskmanagement";
import { EmployeeDirectory } from "./Pages/Hr/EmployeeDirectory";
import { ESignature } from "./Pages/Employee/ESignature";
// import { EmployeeChat } from "./Pages/Employee/EmployeeChat";
// import { HrChat } from "./Pages/Hr/HrChat";
import { HrCommunication } from "./Pages/Hr/HrCommunications";
import { Taskdetails } from "./Pages/Hr/Taskdetails";

import { EditEmployee } from "./Pages/Admin/EditEmployee";
import { ViewTask } from "./Pages/Admin/ViewTask";
import { CreateEmployee } from "./Pages/Admin/Create-employee";
import EmployeeTaskManagement from "./Pages/Employee/EmployeeTaskManagement";
import EditEmployeeTask from "./Pages/Employee/EditEmployeeTask";
import ViewEmployeeTask from "./Pages/Employee/ViewEmployeeTask";
import ViewApplicationForm from "./Pages/Employee/ViewApplicationForm";

import PersonalCareAssistantJD from "./Pages/Employee/PersonalCareAssistantJD";
import EmployeeDetailsUpload from "./Pages/Employee/EmployeeDetailsUpload";
import DrivingLicenseUpload from "./Pages/Employee/DrivingLicenseUpload";
import EditPersonalCareAssistantJD from "./Pages/Employee/EditPersonalCareAssistantJD";
import ViewPersonalCareAssistantJD from "./Pages/Employee/ViewPersonalCareAssistantJD";
import W4Form from "./Pages/Employee/W4Form";
import EditW4Form from "./Pages/Employee/EditW4Form";
import W9Form from "./Pages/Employee/W9Form";
import EditW9Form from "./Pages/Employee/EditW9Form";
import I9Form from "./Pages/Employee/I9Form";
import EditI9Form from "./Pages/Employee/EditI9Form";
import DirectDepositForm from "./Pages/Employee/DirectDepositForm";
import EditDirectDepositForm from "./Pages/Employee/EditDirectDepositForm";
import EmergencyContact from "./Pages/Employee/EmergencyContact";
import EditEmergencyContact from "./Pages/Employee/EditEmergencyContact";
import EmploymentTypeForm from "./Pages/Employee/EmploymentTypeForm";
import StaffOfMisconductForm from "./Pages/Employee/StaffOfMisconductForm";
import EditMisconductForm from "./Pages/Employee/EditMisconductForm";
import CodeofEthics from "./Pages/Employee/CodeofEthics";
import EditCodeofEthics from "./Pages/Employee/EditCodeofEthics";
import ServiceDeliveryPolicies from "./Pages/Employee/ServiceDeliveryPolicies";
import EditServiceDeliveryPolicies from "./Pages/Employee/EditServiceDeliveryPolicies";
import NonCompleteAgreement from "./Pages/Employee/NonCompleteAgreement";
import EditNonCompleteAgreement from "./Pages/Employee/EditNonCompleteAgreement";
import OrientationChecklist from "./Pages/Employee/OrientationChecklist";
import EditOrientationChecklist from "./Pages/Employee/EditOrientationChecklist";
import PCATrainingQuestions from "./Pages/Employee/PCATrainingQuestions";
import TrainingVideo from "./Pages/Employee/TrainingVideo";
import BackgroundFormCheckResults from "./Pages/Employee/BackgroundFormCheckResults";
import CPRFirstAidCertificate from "./Pages/Employee/CPRFirstAidCertificate";
import EditBackgroundFormCheckResults from "./Pages/Employee/EditBackgroundFormCheckResults";
import SymptomScreenForm from "./Pages/Employee/SymptomScreenForm";
import EditSymptomScreenForm from "./Pages/Employee/EditSymptomScreenForm";
import PersonalInformation from "./Pages/Employee/PersonalInformation";
import ProfessionalExperience from "./Pages/Employee/ProfessionalExperience";
import Education from "./Pages/Employee/Education";
import References from "./Pages/Employee/References";
import LegalDisclosures from "./Pages/Employee/LegalDisclosures";
import PositionType from "./Pages/Employee/PositionType";
import OrientationPresentation from "./Pages/Employee/OrientationPresentation";
import WorkExperience from "./Pages/Employee/WorkExperience";
import OnboardingDashboard from "./Pages/Employee/OnboardingDashboard";
import TaskLists from "./Pages/Hr/TaskLists";
import { Task } from "./Pages/Hr/Task";
// import ApplicationReview from './Pages/Hr/ApplicationReview';
// import HREmploymentApplicationViewer from './Pages/Hr/HREmploymentApplicationViewer';
// import HRBackgroundCheckViewer from './Pages/Hr/HRBackgroundCheckViewer';
// import EmploymentApplication from './Pages/Employee/EmploymentApplication'; // Using ViewApplicationForm now

import ApplicationReview from "./Pages/Hr/ApplicationReview";
import HREmploymentApplicationViewer from "./Pages/Hr/HREmploymentApplicationViewer";
import HRBackgroundCheckViewer from "./Pages/Hr/HRBackgroundCheckViewer";
import PersonalCare from "./Pages/Hr/PersonalCare";
import CertifiedNursingAssistantHR from "./Pages/Hr/CertifiedNursingAssistantHR";
import LicensedPracticalNurseHR from "./Pages/Hr/LicensedPracticalNurseHR";
import RegisteredNurseHR from "./Pages/Hr/RegisteredNurseHR";
import OrientationChecklistHR from "./Pages/Hr/OrientationChecklistHR";
import TBSymptomScreenHR from "./Pages/Hr/tb_symptom";
import NonCompeteAgreementHR from "./Pages/Hr/NonCompeteAgreementHR";
import ServiceDeliveryPoliciesHR from "./Pages/Hr/ServiceDeliveryPoliciesHR";
import DirectDepositFormHR from "./Pages/Hr/DirectDepositFormHR";
import BackgroundCheckFormHR from "./Pages/Hr/BackgroundCheckFormHR";
import CodeOfEthicsHR from "./Pages/Hr/CodeOfEthicsHR";
import CodeOfEthicsUpload from "./Pages/Hr/CodeOfEthicsUpload";
import CodeOfEthicsSubmissions from "./Pages/Hr/CodeOfEthicsSubmissions";
import ServiceDeliveryPolicyUpload from "./Pages/Hr/ServiceDeliveryPolicyUpload";
import PCATrainingQuestionsManagement from "./Pages/Hr/PCATrainingQuestionsManagement";
import PCATrainingQuestionsHR from "./Pages/Hr/PCATrainingQuestionsHR";
import ServiceDeliveryPolicySubmissions from "./Pages/Hr/ServiceDeliveryPolicySubmissions";
import NonCompeteSubmissions from "./Pages/Hr/NonCompeteSubmissions";
import BackgroundCheckSubmissions from "./Pages/Hr/BackgroundCheckSubmissions";
import DrivingLicenseSubmissions from "./Pages/Hr/DrivingLicenseSubmissions";
import ServiceDeliveryPolicyEmployee from "./Pages/Employee/ServiceDeliveryPolicyEmployee";
import PCAJobDescriptionSubmissions from "./Pages/Hr/PCAJobDescriptionSubmissions";
import CNAJobDescriptionSubmissions from "./Pages/Hr/CNAJobDescriptionSubmissions";
import LPNJobDescriptionSubmissions from "./Pages/Hr/LPNJobDescriptionSubmissions";
import RNJobDescriptionSubmissions from "./Pages/Hr/RNJobDescriptionSubmissions";
import JobDescriptionSubmissions from "./Pages/Hr/JobDescriptionSubmissions";
import W4FormHR from "./Pages/Hr/W4FormHR";
import W9FormHR from "./Pages/Hr/W9FormHR";
import I9FormHR from "./Pages/Hr/I9FormHR";
import W4Submissions from "./Pages/Hr/W4Submissions";
import W9Submissions from "./Pages/Hr/W9Submissions";
import I9Submissions from "./Pages/Hr/I9Submissions";
import DirectDepositSubmissions from "./Pages/Hr/DirectDepositSubmissions";
import W4FormDetail from "./Pages/Hr/W4FormDetail";
import StaffMisconductStatementHR from "./Pages/Hr/StaffMisconductStatementHR";
import EmergencyContactHR from "./Pages/Hr/EmergencyContactHR";
import EmploymentApplicationHR from "./Pages/Hr/EmploymentApplicationHR";
import WorkExperienceHR from "./Pages/Hr/WorkExperienceHR";
import PersonalInformationHR from "./Pages/Hr/PersonalInformationHR";
import ProfessionalExperienceHR from "./Pages/Hr/ProfessionalExperienceHR";
import EducationHR from "./Pages/Hr/EducationHR";
import ReferencesHR from "./Pages/Hr/ReferencesHR";
import LegalDisclosuresHR from "./Pages/Hr/LegalDisclosuresHR";
import PositionTypeHR from "./Pages/Hr/PositionTypeHR";
import OrientationPresentationHR from "./Pages/Hr/OrientationPresentationHR";
import DrivingLicenseHR from "./Pages/Hr/DrivingLicenseHR";
import EmployeeDetailsUploadHR from "./Pages/Hr/EmployeeDetailsUploadHR";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HrDashboard />} />
          <Route path="/task-management" element={<Taskmanagement />} />
          <Route
            path="/task-management/task-details/:tid"
            element={<Taskdetails />}
          />
          <Route path="/tasks" element={<Task />} />
          <Route path="/task-lists" element={<TaskLists />} />

          {/* HR Application Review Routes */}
          <Route
            path="/hr/application-review/:applicationId"
            element={<ApplicationReview />}
          />
          <Route
            path="/hr/form/employment-application/:applicationId"
            element={<HREmploymentApplicationViewer />}
          />
          <Route
            path="/hr/form/background-check/:applicationId"
            element={<HRBackgroundCheckViewer />}
          />

          {/* <Route path="/hr-chat" element={<HrChat />} /> */}
          <Route path="/hr/communication" element={<HrCommunication />} />
          <Route path="/admin/communication" element={<HrCommunication />} />
          <Route path="/employee-directory" element={<EmployeeDirectory />} />

          <Route path="/admin/dashboard" exact element={<Dashboard />} />
          <Route
            path="/admin/user-management"
            exact
            element={<UserManagement />}
          />
          <Route
            path="/admin/create-employee"
            exact
            element={<CreateEmployee />}
          />
          <Route
            path="/admin/update-employee/:id"
            exact
            element={<EditEmployee />}
          />
          <Route
            path="/admin/monitor-system"
            exact
            element={<MonitorSystem />}
          />
          <Route path="/admin/view-task/:id" exact element={<ViewTask />} />
          <Route
            path="/admin/task-management/task-details/:tid"
            element={<Taskdetails />}
          />
          <Route path="/admin/error-logs" exact element={<ErrorLogs />} />

          <Route
            path="/employee/dashboard"
            exact
            element={<EmployeeDashboard />}
          />
          <Route
            path="/employee/onboarding-dashboard"
            exact
            element={<OnboardingDashboard />}
          />
          <Route
            path="/employment-application"
            exact
            element={<ViewApplicationForm />}
          />
          <Route
            path="/employee/personal-information"
            exact
            element={<PersonalInformation />}
          />
          <Route
            path="/employee/professional-experience"
            exact
            element={<ProfessionalExperience />}
          />
          <Route path="/employee/education" exact element={<Education />} />
          <Route path="/employee/references" exact element={<References />} />
          <Route
            path="/employee/legal-disclosures"
            exact
            element={<LegalDisclosures />}
          />
          <Route
            path="/employee/position-type"
            exact
            element={<PositionType />}
          />
          <Route
            path="/employee/orientation-presentation"
            exact
            element={<OrientationPresentation />}
          />
          <Route
            path="/employee/work-experience"
            exact
            element={<WorkExperience />}
          />
          <Route
            path="/employee/employment-application"
            exact
            element={<ViewApplicationForm />}
          />
          <Route path="/employee/w4-form" exact element={<W4Form />} />
          <Route path="/employee/w9-form" exact element={<W9Form />} />
          <Route
            path="/employee/employment-type"
            exact
            element={<EmploymentTypeForm />}
          />
          <Route path="/employee/i9-form" exact element={<I9Form />} />
          <Route
            path="/employee/emergency-contact"
            exact
            element={<EmergencyContact />}
          />
          <Route
            path="/employee/direct-deposit"
            exact
            element={<DirectDepositForm />}
          />
          <Route
            path="/employee/staff-misconduct"
            exact
            element={<StaffOfMisconductForm />}
          />
          <Route
            path="/employee/misconduct-form"
            exact
            element={<StaffOfMisconductForm />}
          />
          {/* Redirect routes for incorrect /employee/forms/ paths */}
          <Route
            path="/employee/forms/misconduct-form"
            exact
            element={<StaffOfMisconductForm />}
          />
          <Route
            path="/employee/forms/employment-application"
            exact
            element={<ViewApplicationForm />}
          />
          <Route path="/employee/forms/w4-form" exact element={<W4Form />} />
          <Route path="/employee/forms/w9-form" exact element={<W9Form />} />
          <Route
            path="/employee/forms/employment-type"
            exact
            element={<EmploymentTypeForm />}
          />
          <Route path="/employee/forms/i9-form" exact element={<I9Form />} />
          <Route
            path="/employee/forms/emergency-contact"
            exact
            element={<EmergencyContact />}
          />
          <Route
            path="/employee/forms/direct-deposit"
            exact
            element={<DirectDepositForm />}
          />
          <Route
            path="/employee/forms/code-of-ethics"
            exact
            element={<CodeofEthics />}
          />
          <Route
            path="/employee/forms/service-delivery-policies"
            exact
            element={<ServiceDeliveryPolicies />}
          />
          <Route
            path="/employee/forms/non-compete-agreement"
            exact
            element={<NonCompleteAgreement />}
          />
          <Route
            path="/employee/forms/orientation-checklist"
            exact
            element={<OrientationChecklist />}
          />
          <Route
            path="/employee/code-of-ethics"
            exact
            element={<CodeofEthics />}
          />
          <Route
            path="/employee/service-delivery-policies"
            exact
            element={<ServiceDeliveryPolicies />}
          />
          <Route
            path="/employee/non-compete"
            exact
            element={<NonCompleteAgreement />}
          />
          <Route
            path="/employee/non-compete-agreement"
            exact
            element={<NonCompleteAgreement />}
          />
          <Route
            path="/employee/orientation-checklist"
            exact
            element={<OrientationChecklist />}
          />
          <Route
            path="/employee/pca-training-questions"
            exact
            element={<PCATrainingQuestions />}
          />
          <Route
            path="/employee/training-video"
            exact
            element={<TrainingVideo />}
          />
          <Route
            path="/employee/task-management"
            exact
            element={<EmployeeTaskManagement />}
          />
          <Route
            path="/employee/edit-task/:taskId"
            exact
            element={<EditEmployeeTask />}
          />
          <Route
            path="/employee/view-task/:taskId"
            exact
            element={<ViewEmployeeTask />}
          />
          <Route
            path="/employee/application-form/:taskId"
            exact
            element={<ViewApplicationForm />}
          />
          <Route
            path="/employee/edit-application-form/:taskId"
            exact
            element={<ViewApplicationForm />}
          />

          <Route
            path="/employee/view-pca-form/:taskId"
            exact
            element={<PersonalCareAssistantJD />}
          />
          <Route
            path="/employee/edit-pca-form/:taskId"
            exact
            element={<EditPersonalCareAssistantJD />}
          />
          <Route
            path="/employee/view-w4-form/:taskId"
            exact
            element={<W4Form />}
          />
          <Route
            path="/employee/edit-w4-form/:taskId"
            exact
            element={<EditW4Form />}
          />
          <Route
            path="/employee/view-w9-form/:taskId"
            exact
            element={<W9Form />}
          />
          <Route
            path="/employee/edit-w9-form/:taskId"
            exact
            element={<EditW9Form />}
          />
          <Route
            path="/employee/view-i9-form/:taskId"
            exact
            element={<I9Form />}
          />
          <Route
            path="/employee/edit-i9-form/:taskId"
            exact
            element={<EditI9Form />}
          />
          <Route
            path="/employee/view-direct-deposit-form/:taskId"
            exact
            element={<DirectDepositForm />}
          />
          <Route
            path="/employee/edit-direct-deposit-form/:taskId"
            exact
            element={<EditDirectDepositForm />}
          />
          <Route
            path="/employee/view-emergency-contact/:taskId"
            exact
            element={<EmergencyContact />}
          />
          <Route
            path="/employee/edit-emergency-contact/:taskId"
            exact
            element={<EditEmergencyContact />}
          />
          <Route
            path="/employee/view-misconduct-form/:taskId"
            exact
            element={<StaffOfMisconductForm />}
          />
          <Route
            path="/employee/edit-misconduct-form/:taskId"
            exact
            element={<EditMisconductForm />}
          />
          <Route
            path="/employee/view-code-of-ethics/:taskId"
            exact
            element={<CodeofEthics />}
          />
          <Route
            path="/employee/edit-code-of-ethics/:taskId"
            exact
            element={<EditCodeofEthics />}
          />
          <Route
            path="/employee/view-service-delivery-policies/:taskId"
            exact
            element={<ServiceDeliveryPolicies />}
          />
          <Route
            path="/employee/edit-service-delivery-policies/:taskId"
            exact
            element={<EditServiceDeliveryPolicies />}
          />
          <Route
            path="/employee/view-non-compete-agreement/:taskId"
            exact
            element={<NonCompleteAgreement />}
          />
          <Route
            path="/employee/edit-non-compete-agreement/:taskId"
            exact
            element={<EditNonCompleteAgreement />}
          />
          <Route
            path="/employee/view-orientation-checklist/:taskId"
            exact
            element={<OrientationChecklist />}
          />
          <Route
            path="/employee/edit-orientation-checklist/:taskId"
            exact
            element={<EditOrientationChecklist />}
          />
          <Route
            path="/employee/view-background-form-check-results/:taskId"
            exact
            element={<BackgroundFormCheckResults />}
          />
          <Route
            path="/employee/background-check-upload"
            exact
            element={<BackgroundFormCheckResults />}
          />
          <Route
            path="/employee/cpr-first-aid-certificate"
            exact
            element={<CPRFirstAidCertificate />}
          />
          <Route
            path="/employee/edit-background-form-check-results"
            exact
            element={<EditBackgroundFormCheckResults />}
          />
          <Route
            path="/employee/view-tb-symptom-screen-form/:taskId"
            exact
            element={<SymptomScreenForm />}
          />
          <Route
            path="/employee/edit-tb-symptom-screen-form"
            exact
            element={<EditSymptomScreenForm />}
          />
          <Route
            path="/employee/driving-license-upload"
            exact
            element={<DrivingLicenseUpload />}
          />
          <Route
            path="/employee/view-job-description-pca/:taskId"
            exact
            element={<ViewPersonalCareAssistantJD />}
          />
          <Route
            path="/employee/edit-job-description-pca/:taskId"
            exact
            element={<EditPersonalCareAssistantJD />}
          />
          <Route path="/employee/e-signature" exact element={<ESignature />} />
          <Route
            path="/employee/job-description-pca"
            exact
            element={<PersonalCareAssistantJD />}
          />
          <Route
            path="/employee/employee-details-upload"
            exact
            element={<EmployeeDetailsUpload />}
          />
          {/* <Route
            path="/employee/chat/3123213123sqws"
            exact
            element={<Model />}
          /> */}
          <Route
            path="/employee/personal-details"
            exact
            element={<PersonalDetails />}
          />
          <Route
            path="/employee/communications"
            exact
            element={<Communications />}
          />
          <Route
            path="/employee/training-resources"
            exact
            element={<TrainingResources />}
          />
          <Route path="/auth/log-in" exact element={<Login />} />
          <Route path="/auth/register" exact element={<Register />} />
          <Route path="/task" element={<Task />} />
          <Route path="/task-lists" element={<TaskLists />} />
          <Route path="/document-management" element={<DocumentManagement />} />

          <Route
            path="/hr/application-review/:applicationId"
            element={<ApplicationReview />}
          />
          <Route
            path="/hr/form/employment-application/:applicationId"
            element={<HREmploymentApplicationViewer />}
          />
          <Route
            path="/hr/form/background-check/:applicationId"
            element={<HRBackgroundCheckViewer />}
          />
          <Route
            path="/hr/job-description/pca/:employeeId"
            element={<PersonalCare />}
          />
          <Route
            path="/hr/job-description/cna/:employeeId"
            element={<CertifiedNursingAssistantHR />}
          />
          <Route
            path="/hr/job-description/lpn/:employeeId"
            element={<LicensedPracticalNurseHR />}
          />
          <Route
            path="/hr/job-description/rn/:employeeId"
            element={<RegisteredNurseHR />}
          />
          <Route
            path="/hr/orientation-checklist/:employeeId"
            element={<OrientationChecklistHR />}
          />
          <Route
            path="/hr/tb-symptom-screen/:employeeId"
            element={<TBSymptomScreenHR />}
          />
          <Route
            path="/hr/non-compete-agreement/:employeeId"
            element={<NonCompeteAgreementHR />}
          />
          <Route
            path="/hr/service-delivery-policies/:employeeId"
            element={<ServiceDeliveryPoliciesHR />}
          />
          <Route
            path="/hr/direct-deposit-form/:employeeId"
            element={<DirectDepositFormHR />}
          />
          <Route path="/hr/w9-form/:employeeId" element={<W9FormHR />} />
          <Route
            path="/hr/background-check-form/:employeeId"
            element={<BackgroundCheckFormHR />}
          />
          <Route
            path="/hr/code-of-ethics/:employeeId"
            element={<CodeOfEthicsHR />}
          />
          <Route
            path="/hr/code-of-ethics-upload"
            element={<CodeOfEthicsUpload />}
          />
          <Route
            path="/hr/code-of-ethics-submissions"
            element={<CodeOfEthicsSubmissions />}
          />
          <Route
            path="/hr/service-delivery-policy-upload"
            element={<ServiceDeliveryPolicyUpload />}
          />
          <Route
            path="/hr/service-delivery-policy-submissions"
            element={<ServiceDeliveryPolicySubmissions />}
          />
          <Route
            path="/hr/pca-training-management"
            element={<PCATrainingQuestionsManagement />}
          />
          <Route
            path="/hr/pca-training-questions/:employeeId"
            element={<PCATrainingQuestionsHR />}
          />
          <Route
            path="/hr/non-compete-submissions"
            element={<NonCompeteSubmissions />}
          />
          <Route
            path="/hr/background-check-submissions"
            element={<BackgroundCheckSubmissions />}
          />
          <Route
            path="/hr/driving-license-submissions"
            element={<DrivingLicenseSubmissions />}
          />
          <Route
            path="/employee/service-delivery-policy-document"
            element={<ServiceDeliveryPolicyEmployee />}
          />
          <Route
            path="/hr/job-description-submissions"
            element={<JobDescriptionSubmissions />}
          />
          <Route
            path="/hr/pca-job-description-submissions"
            element={<PCAJobDescriptionSubmissions />}
          />
          <Route
            path="/hr/cna-job-description-submissions"
            element={<CNAJobDescriptionSubmissions />}
          />
          <Route
            path="/hr/lpn-job-description-submissions"
            element={<LPNJobDescriptionSubmissions />}
          />
          <Route
            path="/hr/rn-job-description-submissions"
            element={<RNJobDescriptionSubmissions />}
          />
          <Route path="/hr/w4-form" element={<W4FormHR />} />
          <Route path="/hr/w9-form" element={<W9FormHR />} />
          <Route path="/hr/i9-form" element={<I9FormHR />} />
          <Route path="/hr/w4-submissions" element={<W4Submissions />} />
          <Route path="/hr/w4-form-detail/:id" element={<W4FormDetail />} />
          <Route path="/hr/w4-form/:employeeId" element={<W4FormHR />} />
          <Route path="/hr/w9-submissions" element={<W9Submissions />} />
          <Route path="/hr/i9-submissions" element={<I9Submissions />} />
          <Route
            path="/hr/direct-deposit-submissions"
            element={<DirectDepositSubmissions />}
          />
          <Route
            path="/hr/staff-misconduct-statement/:employeeId"
            element={<StaffMisconductStatementHR />}
          />
          <Route
            path="/hr/emergency-contact/:employeeId"
            element={<EmergencyContactHR />}
          />
          <Route path="/hr/i9-form/:employeeId" element={<I9FormHR />} />
          <Route
            path="/hr/employment-application/:employeeId"
            element={<EmploymentApplicationHR />}
          />
          <Route
            path="/hr/personal-information/:employeeId"
            element={<PersonalInformationHR />}
          />
          <Route
            path="/hr/professional-experience/:employeeId"
            element={<ProfessionalExperienceHR />}
          />
          <Route
            path="/hr/work-experience/:employeeId"
            element={<WorkExperienceHR />}
          />
          <Route path="/hr/education/:employeeId" element={<EducationHR />} />
          <Route path="/hr/references/:employeeId" element={<ReferencesHR />} />
          <Route
            path="/hr/legal-disclosures/:employeeId"
            element={<LegalDisclosuresHR />}
          />
          <Route
            path="/hr/position-type/:employeeId"
            element={<PositionTypeHR />}
          />
          <Route
            path="/hr/orientation-presentation/:employeeId"
            element={<OrientationPresentationHR />}
          />
          <Route
            path="/hr/driving-license/:employeeId"
            element={<DrivingLicenseHR />}
          />
          <Route
            path="/hr/employee-details-upload/:employeeId"
            element={<EmployeeDetailsUploadHR />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
