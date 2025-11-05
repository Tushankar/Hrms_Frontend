import React, { useState, useEffect } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { Calendar, Clock, AlertTriangle, ArrowLeft, Upload, Paperclip, Calendar as CalendarIcon, CheckCircle, Info, Clock as ClockIcon, X, Send, Save, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export const EditEmployeeTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  
  // Task form state
  const [task, setTask] = useState({
    id: "",
    name: "",
    priority: "Medium",
    type: "Documentation",
    creationDate: "",
    status: "In Progress",
    description: "",
    dueDate: "",
    notes: "",
    assignedBy: "",
    assignedDate: "",
    lastEditDate: "",
    submissionStatus: "Not Started",
    formsCompleted: 0,
    totalForms: 0,
    hrReviewStatus: null
  });

  // Forms data state
  const [forms, setForms] = useState([]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);

  // Files state
  const [files, setFiles] = useState([]);
  const [filePreview, setFilePreview] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // In a real application, fetch the task data from API
  useEffect(() => {
    // Simulating API call to fetch task details
    setIsLoading(true);
    
    // This is mock data - in a real app you'd fetch from an API
    setTimeout(() => {
      // Mock task data based on taskId
      const mockTasks = [
        {
          id: "1",
          name: "Employment Application",
          priority: "High",
          type: "Documentation",
          creationDate: "2025-07-15",
          dueDate: "2025-08-15",
          status: "In Progress",
          description: "Create a comprehensive project proposal document that outlines scope, timeline, resources, and budget requirements.",
          notes: "Include executive summary and risk assessment sections.",
          assignedBy: "John Smith (HR Manager)",
          assignedDate: "2025-07-14",
          lastEditDate: "2025-07-28",
          submissionStatus: "Draft",
          formsCompleted: 2,
          totalForms: 4,
          hrReviewStatus: null
        },
        {
          id: "2",
          name: "Certified Nursing Assistant(JD)",
          priority: "Medium",
          type: "Documentation",
          creationDate: "2025-07-20",
          dueDate: "2025-07-31",
          status: "In Progress",
          description: "Review and complete the Certified Nursing Assistant Job Description document.",
          notes: "Ensure all job duties, qualifications, and requirements are accurately documented.",
          assignedBy: "Sarah Johnson (Team Lead)",
          assignedDate: "2025-07-18",
          lastEditDate: "2025-07-25",
          submissionStatus: "Draft",
          formsCompleted: 1,
          totalForms: 1,
          hrReviewStatus: null
        },
        {
          id: "3",
          name: "Licensed Practical Nurse(JD)",
          priority: "High",
          type: "Presentation",
          creationDate: "2025-07-25",
          dueDate: "2025-08-05",
          status: "Pending",
          description: "Prepare slides and demo for the upcoming client presentation.",
          notes: "Focus on highlighting key achievements and addressing client concerns.",
          assignedBy: "John Smith (HR Manager)",
          assignedDate: "2025-07-24",
          lastEditDate: null,
          submissionStatus: "Not Started",
          formsCompleted: 0,
          totalForms: 5,
          hrReviewStatus: null
        },
      ];

      // Mock forms data for each task
      const mockForms = {
        "1": [
          { id: 1, name: "Project Scope Form", status: "Completed", data: { scope: "Full system implementation", budget: "$50,000" } },
          { id: 2, name: "Timeline Form", status: "Completed", data: { startDate: "2025-08-01", endDate: "2025-12-31" } },
          { id: 3, name: "Resources Form", status: "Draft", data: { teamSize: "5", skillsRequired: "React, Node.js" } },
          { id: 4, name: "Risk Assessment Form", status: "Not Started", data: {} }
        ],
        "2": [
          { id: 1, name: "Meeting Agenda", status: "Completed", data: { topics: "Sprint review, Planning" } },
          { id: 2, name: "Status Report", status: "Completed", data: { progress: "85%", blockers: "None" } },
          { id: 3, name: "Action Items", status: "Completed", data: { items: "Registered Nurse (JD), PHS-W-4 Form" } }
        ],
        "3": [
          { id: 1, name: "Presentation Outline", status: "Not Started", data: {} },
          { id: 2, name: "Demo Script", status: "Not Started", data: {} },
          { id: 3, name: "Technical Details", status: "Not Started", data: {} },
          { id: 4, name: "Q&A Preparation", status: "Not Started", data: {} },
          { id: 5, name: "Slides Design", status: "Not Started", data: {} }
        ]
      };

      const foundTask = mockTasks.find(t => t.id === taskId);
      
      if (foundTask) {
        setTask(foundTask);
        setForms(mockForms[taskId] || []);
        setIsLoading(false);
      } else {
        setError("Task not found");
        setIsLoading(false);
      }
    }, 800); // Simulating network delay
  }, [taskId]);

  // Handle form input changes (only for editable fields)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: value,
      lastEditDate: new Date().toISOString().split('T')[0] // Update last edit date
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    
    // Preview the first file if it's an image
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
    
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  // Remove a file from the list
  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    if (indexToRemove === 0) {
      setFilePreview(null);
    }
  };

  // Handle form data changes
  const handleFormDataChange = (formId, field, value) => {
    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, data: { ...form.data, [field]: value }, status: 'Draft' }
        : form
    ));
    
    // Update task last edit date
    setTask(prev => ({
      ...prev,
      lastEditDate: new Date().toISOString().split('T')[0]
    }));
  };

  // Save form as draft
  const saveFormAsDraft = (formId) => {
    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, status: 'Draft' }
        : form
    ));
    
    // Update forms completed count
    const completedCount = forms.filter(f => f.status === 'Completed').length;
    setTask(prev => ({
      ...prev,
      formsCompleted: completedCount,
      submissionStatus: completedCount > 0 ? 'Draft' : 'Not Started'
    }));
    
    setSuccessMessage("Form saved as draft!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Complete a form
  const completeForm = (formId) => {
    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, status: 'Completed' }
        : form
    ));
    
    // Update forms completed count
    const updatedForms = forms.map(form => 
      form.id === formId ? { ...form, status: 'Completed' } : form
    );
    const completedCount = updatedForms.filter(f => f.status === 'Completed').length;
    
    setTask(prev => ({
      ...prev,
      formsCompleted: completedCount,
      submissionStatus: completedCount === forms.length ? 'Ready to Submit' : 'Draft'
    }));
    
    setSuccessMessage("Form completed!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Submit all forms to HR
  const submitToHR = () => {
    const allFormsCompleted = forms.every(form => form.status === 'Completed');
    
    if (!allFormsCompleted) {
      setError("Please complete all forms before submitting to HR.");
      setTimeout(() => setError(""), 5000);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to submit to HR
    setTimeout(() => {
      setTask(prev => ({
        ...prev,
        submissionStatus: 'Submitted',
        hrReviewStatus: 'Under Review',
        status: 'Completed'
      }));
      
      setSuccessMessage("Successfully submitted to HR for review!");
      setIsLoading(false);
      setShowSubmitConfirm(false);
      
      setTimeout(() => {
        navigate('/employee/task-management');
      }, 2000);
    }, 1000);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Create form data for files
    const formData = new FormData();
    formData.append('taskId', task.id);
    formData.append('status', task.status);
    formData.append('notes', task.notes);
    
    // Append files to form data
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Simulate API call to update task
    setTimeout(() => {
      // In a real app, this would be an API call with formData
      console.log("Task updated:", task);
      console.log("Files to upload:", files);
      
      setSuccessMessage("Task updated successfully!");
      setIsLoading(false);
      
      // After a brief delay, navigate back to the task list
      setTimeout(() => {
        navigate('/employee/task-management');
      }, 1500);
    }, 800);
  };

  if (isLoading && !task.id) {
    return (
      <Layout>
        <div className="w-full h-full bg-gray-50 min-h-screen">
          <Navbar />
          <div className="flex flex-col w-full p-4 md:p-6 lg:p-8 items-center justify-center">
            <div className="w-full max-w-4xl flex justify-center items-center py-20">
              <div className="animate-pulse flex flex-col w-full">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-10"></div>
                <div className="h-36 bg-gray-200 rounded w-full mb-6"></div>
                <div className="h-20 bg-gray-200 rounded w-full mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3 mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="w-full h-full bg-gray-50 min-h-screen">
          <Navbar />
          <div className="flex flex-col w-full p-4 md:p-6 lg:p-8 items-center justify-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg w-full text-center">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn't find the task you're looking for. It may have been deleted or you might not have permission to view it.
              </p>
              <button 
                onClick={() => navigate('/employee/task-management')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Back to Task List
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentForm = forms[currentFormIndex];

  return (
    <Layout>
      <div className="w-full h-full bg-gray-50 min-h-screen">
        <Navbar />
        
        <div className="flex flex-col w-full p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/employee/task-management')}
              className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks
            </button>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {task.name}
            </h1>
            <p className="text-gray-600">
              Complete and submit forms for HR review
            </p>
          </div>
          
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-xl">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Task Overview Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Progress</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${(task.formsCompleted / task.totalForms) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {task.formsCompleted}/{task.totalForms}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Submission Status</h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  task.submissionStatus === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                  task.submissionStatus === 'Ready to Submit' ? 'bg-green-100 text-green-700' :
                  task.submissionStatus === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.submissionStatus}
                </span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">HR Review</h3>
                {task.hrReviewStatus ? (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.hrReviewStatus === 'Accepted' ? 'bg-green-100 text-green-700' :
                    task.hrReviewStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {task.hrReviewStatus}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Pending submission</span>
                )}
              </div>
            </div>
          </div>

          {/* Forms Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Forms List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Forms</h3>
                <div className="space-y-3">
                  {forms.map((form, index) => (
                    <button
                      key={form.id}
                      onClick={() => setCurrentFormIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentFormIndex === index 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-900">{form.name}</h4>
                        <div className="flex items-center gap-1">
                          {form.status === 'Completed' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {form.status === 'Draft' && (
                            <Save className="w-4 h-4 text-yellow-600" />
                          )}
                          {form.status === 'Not Started' && (
                            <FileText className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{form.status}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Form */}
            <div className="lg:col-span-3">
              {currentForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{currentForm.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentFormIndex(Math.max(0, currentFormIndex - 1))}
                        disabled={currentFormIndex === 0}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentFormIndex(Math.min(forms.length - 1, currentFormIndex + 1))}
                        disabled={currentFormIndex === forms.length - 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Form Fields */}
                  <div className="space-y-4 mb-6">
                    {currentForm.id === 1 && currentForm.name.includes("Scope") && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project Scope</label>
                          <textarea
                            value={currentForm.data.scope || ''}
                            onChange={(e) => handleFormDataChange(currentForm.id, 'scope', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Describe the project scope..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
                          <input
                            type="text"
                            value={currentForm.data.budget || ''}
                            onChange={(e) => handleFormDataChange(currentForm.id, 'budget', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="$0.00"
                          />
                        </div>
                      </>
                    )}

                    {currentForm.id === 2 && currentForm.name.includes("Timeline") && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={currentForm.data.startDate || ''}
                            onChange={(e) => handleFormDataChange(currentForm.id, 'startDate', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="date"
                            value={currentForm.data.endDate || ''}
                            onChange={(e) => handleFormDataChange(currentForm.id, 'endDate', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}

                    {currentForm.id === 3 && currentForm.name.includes("Resources") && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                          <input
                            type="number"
                            value={currentForm.data.teamSize || ''}
                            onChange={(e) => handleFormDataChange(currentForm.id, 'teamSize', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Number of team members"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required</label>
                          <textarea
                            value={currentForm.data.skillsRequired || ''}
                            onChange={(e) => handleFormDataChange(currentForm.id, 'skillsRequired', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="List required skills and technologies..."
                          />
                        </div>
                      </>
                    )}

                    {/* Generic form for other forms */}
                    {!currentForm.name.includes("Scope") && !currentForm.name.includes("Timeline") && !currentForm.name.includes("Resources") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Content</label>
                        <textarea
                          value={currentForm.data.content || ''}
                          onChange={(e) => handleFormDataChange(currentForm.id, 'content', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="5"
                          placeholder={`Fill in the ${currentForm.name.toLowerCase()} details...`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => saveFormAsDraft(currentForm.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save as Draft
                    </button>
                    <button
                      onClick={() => completeForm(currentForm.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit to HR Section */}
          {task.formsCompleted === task.totalForms && task.submissionStatus !== 'Submitted' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Ready to Submit!</h3>
                  <p className="text-green-700">All forms have been completed. You can now submit to HR for review.</p>
                </div>
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Submit to HR
                </button>
              </div>
            </div>
          )}

          {/* Submit Confirmation Modal */}
          {showSubmitConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Submission</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to submit all forms to HR for review? Once submitted, you won't be able to make changes.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitToHR}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : 'Confirm Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditEmployeeTask;
